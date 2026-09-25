<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { prefersReducedMotion } from '../../utils/motion'
import Aurora from '../aurora/Aurora.vue'
import StatusText from '../status-text/StatusText.vue'

/**
 * An image being made, becoming itself rather than appearing. While there is none yet the box is
 * an Aurora thinking, and nothing else. When the image arrives, fine grains in the aurora's colours
 * come out of the light all over the box, and the whole swarm turns into the picture: each grain
 * travels to its place on a slight curve, takes the colour there and grows to meet its neighbours,
 * and the image itself comes into focus over the grains once they have settled.
 */
const props = withDefaults(
  defineProps<{
    /** The image; leave it out while it is being made. */
    src?: string
    alt: string
    /** Its shape, as CSS `aspect-ratio`. */
    aspect?: string
    /** A line shown while it is made, such as "Creating image"; none by default. */
    status?: string
    /** Distance between grains once they form the image, in pixels. */
    grain?: number
    class?: HTMLAttributes['class']
  }>(),
  { aspect: '1 / 1', grain: 4 },
)

type Phase = 'waiting' | 'forming' | 'done'
const phase = ref<Phase>('waiting')

const box = useTemplateRef<HTMLElement>('box')
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const swatches = useTemplateRef<HTMLElement>('swatches')

// The aurora's colours as numbers, read off a 1px canvas once the browser has resolved the tokens
// (`light-dark()`, `oklch()`), so a grain can blend from one into the image's.
type RGB = [number, number, number]
let palette: RGB[] = [[128, 128, 160]]
function readPalette() {
  const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  if (!probe) return
  palette = [...(swatches.value?.children ?? [])].map((el) => {
    probe.clearRect(0, 0, 1, 1)
    probe.fillStyle = getComputedStyle(el).color
    probe.fillRect(0, 0, 1, 1)
    const [r = 0, g = 0, b = 0] = probe.getImageData(0, 0, 1, 1).data
    return [r, g, b] as RGB
  })
}

// One grain per cell of the finished picture.
interface Grain {
  x: number
  y: number
  colour: RGB
  // Where it goes in the picture, its colour there, and when it sets off.
  tx: number
  ty: number
  target?: RGB
  from?: { x: number; y: number }
  delay: number
  swirl: number
}
let grains: Grain[] = []
let size = { width: 0, height: 0, cols: 0, rows: 0 }

function measure() {
  const el = box.value
  const c = canvas.value
  if (!el || !c) return
  const ratio = window.devicePixelRatio || 1
  const width = el.clientWidth
  const height = el.clientHeight
  c.width = Math.round(width * ratio)
  c.height = Math.round(height * ratio)
  c.getContext('2d')?.setTransform(ratio, 0, 0, ratio, 0, 0)
  const cols = Math.ceil(width / props.grain)
  const rows = Math.ceil(height / props.grain)
  if (cols === size.cols && rows === size.rows) return
  size = { width, height, cols, rows }
  // Each grain has a cell of the picture, but starts anywhere, so they cross on their way.
  grains = Array.from({ length: cols * rows }, (_, i) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    colour: palette[i % palette.length]!,
    tx: ((i % cols) + 0.5) * props.grain,
    ty: (Math.floor(i / cols) + 0.5) * props.grain,
    delay: Math.random() * 500,
    swirl: (Math.random() - 0.5) * 60,
  }))
  if (image) sample(image)
}

// The picture's colour in each grain's cell, the image covering the box.
let image: HTMLImageElement | undefined
function sample(img: HTMLImageElement) {
  const { cols, rows } = size
  const off = document.createElement('canvas')
  off.width = cols
  off.height = rows
  const ctx = off.getContext('2d', { willReadFrequently: true })
  if (!ctx || !img.naturalWidth) return
  const scale = Math.max(cols / img.naturalWidth, rows / img.naturalHeight)
  const w = img.naturalWidth * scale
  const h = img.naturalHeight * scale
  ctx.drawImage(img, (cols - w) / 2, (rows - h) / 2, w, h)
  let data: Uint8ClampedArray | undefined
  try {
    data = ctx.getImageData(0, 0, cols, rows).data
  } catch {
    // Another site's image without CORS cannot be read: the grains keep their own colours.
  }
  grains.forEach((grain, i) => {
    grain.target = data ? [data[i * 4]!, data[i * 4 + 1]!, data[i * 4 + 2]!] : undefined
  })
}

const EMERGE = 350 // the grains coming out of the light
const TRAVEL = 1100 // each grain's journey
const FOCUS = 1700 // the image comes into focus this long after the grains appear
let frame = 0
let formedAt = 0
const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2)
const solid = ([r, g, b]: RGB) => `rgb(${r} ${g} ${b})`
const mix = (a: RGB, b: RGB, p: number) => `rgb(${a[0] + (b[0] - a[0]) * p} ${a[1] + (b[1] - a[1]) * p} ${a[2] + (b[2] - a[2]) * p})`

function draw(now: number) {
  const c = canvas.value?.getContext('2d')
  if (!c) return
  const { width, height } = size
  const forming = phase.value !== 'waiting'
  const since = now - formedAt
  c.clearRect(0, 0, width, height)
  for (const grain of grains) {
    if (!forming) continue
    // Forming: each grain comes out of the light where it is, then goes to its cell on a slight
    // curve, taking the picture's colour and growing to meet its neighbours.
    grain.from ??= { x: grain.x, y: grain.y }
    const emerge = Math.min(1, since / EMERGE)
    const p = ease(Math.min(1, Math.max(0, (since - EMERGE * 0.6 - grain.delay) / TRAVEL)))
    const bend = Math.sin(Math.PI * p) * grain.swirl
    const x = grain.from.x + (grain.tx - grain.from.x) * p + bend
    const y = grain.from.y + (grain.ty - grain.from.y) * p - bend * 0.5
    const side = 1.6 + (props.grain + 0.6 - 1.6) * p
    c.globalAlpha = emerge * (0.6 + 0.4 * p)
    c.fillStyle = grain.target ? mix(grain.colour, grain.target, p) : solid(grain.colour)
    c.fillRect(x - side / 2, y - side / 2, side, side)
  }
  c.globalAlpha = 1
  if (phase.value === 'forming' && since > FOCUS) phase.value = 'done'
  // Keeps drawing under the image as it comes into focus, then stops; a new wait stops it at once.
  if (phase.value === 'forming' || (phase.value === 'done' && since < FOCUS + 800)) frame = requestAnimationFrame(draw)
  else frame = 0
}
const run = () => {
  if (!frame && !prefersReducedMotion()) frame = requestAnimationFrame(draw)
}

// A new image: loaded and read first, then the swarm turns into it.
let loading = 0
function load(src: string | undefined) {
  const ticket = ++loading
  image = undefined
  phase.value = 'waiting'
  canvas.value?.getContext('2d')?.clearRect(0, 0, size.width, size.height)
  for (const grain of grains) {
    grain.from = undefined
    grain.target = undefined
  }
  if (!src) return
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.decoding = 'async'
  img.onload = () => {
    if (ticket !== loading) return
    image = img
    sample(img)
    if (prefersReducedMotion()) return void (phase.value = 'done')
    formedAt = performance.now()
    phase.value = 'forming'
    run()
  }
  // Not readable with CORS: loaded plainly, and the grains keep their colours.
  img.onerror = () => {
    if (ticket !== loading || img.crossOrigin === null) return
    img.crossOrigin = null
    img.src = src
  }
  img.src = src
}
watch(() => props.src, load)

let observer: ResizeObserver | undefined
onMounted(() => {
  readPalette()
  measure()
  observer = new ResizeObserver(measure)
  if (box.value) observer.observe(box.value)
  load(props.src)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(frame)
  loading++
})

const done = computed(() => phase.value === 'done')
</script>

<template>
  <div
    ref="box"
    role="img"
    :aria-label="alt"
    :aria-busy="!done || undefined"
    :style="{ aspectRatio: aspect }"
    :class="cn('relative isolate overflow-hidden rounded-[var(--image-reveal-radius,var(--radius-lg))] bg-bg-subtle', props.class)"
  >
    <Aurora
      :activity="phase === 'waiting' ? 'thinking' : 'rest'"
      :class="['absolute inset-0 transition-opacity duration-1000 ease-soft', phase !== 'waiting' && 'opacity-0']"
    />
    <canvas
      ref="canvas"
      aria-hidden="true"
      :class="['absolute inset-0 size-full transition-opacity duration-700 ease-soft', done && 'opacity-0']"
    />
    <img v-if="src && done" :src="src" alt="" class="absolute inset-0 size-full animate-blur-in object-cover motion-reduce:animate-none" />
    <Transition leave-active-class="transition-opacity duration-300" leave-to-class="opacity-0">
      <StatusText v-if="phase === 'waiting'" :text="`${status}…`" working as="p" class="absolute bottom-3 left-4 text-sm text-fg" />
    </Transition>
    <!-- The aurora's colours, for the canvas to read once the browser has resolved them. -->
    <span ref="swatches" aria-hidden="true" class="hidden">
      <span class="text-[color:var(--aurora-1,oklch(0.68_0.16_255))]" />
      <span class="text-[color:var(--aurora-2,oklch(0.7_0.17_295))]" />
      <span class="text-[color:var(--aurora-3,oklch(0.82_0.11_60))]" />
      <span class="text-[color:var(--aurora-4,oklch(0.74_0.14_350))]" />
    </span>
  </div>
</template>
