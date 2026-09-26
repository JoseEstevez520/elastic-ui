<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { boxOf, useMorphBox } from '../../composables/useMorphBox'
import { XIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'

/**
 * An image that grows into full view where it is. Pressed, the picture itself grows from its place
 * to the whole of it in the middle of the screen, at its own proportions and a real size
 * (useMorphBox): its crop opens out as the box takes the image's shape, the page dimmed behind.
 * Its caption comes into focus under it, and a cross sits in its top right corner, white or black
 * by that corner's own light, with nothing behind it. Closing (a click anywhere, Escape, the
 * cross), the caption goes first, then the picture folds back into its place.
 *
 * Not on Reka UI's Dialog: its scroll lock takes the page's scrollbar away and shifts the page
 * under the picture, which then lands a few pixels off its place and jumps. Here the page keeps
 * its scrollbar's room while it cannot scroll, and the view is shown in the same frame it opens.
 */
const props = withDefaults(
  defineProps<{
    src: string
    alt: string
    caption?: string
    /** A larger file for the full view; the thumbnail's own `src` if not given. */
    fullSrc?: string
    closeLabel?: string
    fullViewLabel?: string
    /** Applied to the thumbnail. */
    class?: HTMLAttributes['class']
  }>(),
  { closeLabel: labelFor('close'), fullViewLabel: labelFor('fullView') },
)

const open = defineModel<boolean>('open', { default: false })
const thumb = useTemplateRef<HTMLImageElement>('thumb')
const full = computed(() => props.fullSrc ?? props.src)

// The whole picture: as large as fits the screen, with room around it and for its caption, at the
// image's own proportions, and never larger than the file.
const MARGIN = 32
const CAPTION = 56
function fullBox() {
  const img = thumb.value!
  const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 4 / 3
  const room = props.caption ? CAPTION : 0
  const maxW = innerWidth - MARGIN * 2
  const maxH = innerHeight - MARGIN * 2 - room
  const width = Math.min(maxW, maxH * ratio, props.fullSrc ? maxW : img.naturalWidth || maxW)
  const height = width / ratio
  return { top: (innerHeight - height - room) / 2, left: (innerWidth - width) / 2, width, height }
}

const radius = ref('0px')
const { shown, grown, visible, settled, to, style } = useMorphBox({
  open,
  from: () => {
    if (thumb.value) radius.value = getComputedStyle(thumb.value).borderRadius
    return boxOf(thumb.value)
  },
  to: fullBox,
  returnFocus: () => thumb.value,
  // It travels from anywhere on the page to the middle: a gentle start shows it leaving its place.
  openTransition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] },
})
const pictureStyle = computed(() => style({ borderRadius: [radius.value, 'var(--image-view-radius, 12px)'] }))
const captionStyle = computed(() => to.value && { top: `${to.value.top + to.value.height + 16}px` })

// The cross, in the picture's top right corner where it lands.
const INSET = 12
const crossStyle = computed(() => {
  const b = to.value
  return b && { top: `${b.top + INSET}px`, left: `${b.left + b.width - INSET - 36}px` }
})

// White over a dark corner, black over a light one, read from the corner's own pixels. A picture
// from elsewhere that forbids reading them keeps it white.
const crossOnLight = ref(false)
function readCorner() {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 8
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    // As much of the corner as the cross and its inset cover in full view.
    const side = Math.min(img.naturalWidth, img.naturalHeight) * 0.12
    ctx.drawImage(img, img.naturalWidth - side, 0, side, side, 0, 0, 8, 8)
    try {
      const px = ctx.getImageData(0, 0, 8, 8).data
      let light = 0
      for (let i = 0; i < px.length; i += 4) light += 0.2126 * px[i]! + 0.7152 * px[i + 1]! + 0.0722 * px[i + 2]!
      crossOnLight.value = light / (px.length / 4) / 255 > 0.5
    } catch {
      crossOnLight.value = false
    }
  }
  img.src = full.value
}

function openView() {
  readCorner()
  open.value = true
}

// The page cannot scroll behind it, and keeps its scrollbar's room, so nothing under it moves.
// Locked as soon as it is asked to open, before the picture is out: a change to the page's
// overflow in the frame the picture appears can cost it its starting place, and it would jump to
// full view instead of growing.
const root = document.documentElement
function lockScroll(lock: boolean) {
  const scrolls = root.scrollHeight > root.clientHeight
  root.style.overflow = lock ? 'hidden' : ''
  root.style.scrollbarGutter = lock && scrolls ? 'stable' : ''
}
watch(open, (isOpen) => isOpen && lockScroll(true), { flush: 'sync' })
watch(shown, (isShown) => !isShown && lockScroll(false))
onBeforeUnmount(() => shown.value && lockScroll(false))

// Landed, the cross takes the focus and keeps it: it is all there is to reach. Escape closes.
const cross = useTemplateRef<HTMLButtonElement>('cross')
watch(settled, (isSettled) => isSettled && cross.value?.focus({ preventScroll: true }))
useEventListener<KeyboardEvent>(
  () => document,
  'keydown',
  (e) => {
    if (!open.value) return
    if (e.key === 'Escape') open.value = false
    else if (e.key === 'Tab') (e.preventDefault(), cross.value?.focus())
  },
)
</script>

<template>
  <img
    ref="thumb"
    :src="src"
    :alt="alt"
    tabindex="0"
    role="button"
    aria-haspopup="dialog"
    :aria-label="`${alt}, ${fullViewLabel}`"
    :class="cn('cursor-zoom-in focus-ring', shown && 'invisible', props.class)"
    @click="openView"
    @keydown.enter.prevent="openView"
    @keydown.space.prevent="openView"
  />
  <Teleport to="body">
    <template v-if="shown">
      <div
        :class="[
          'fixed inset-0 z-50 cursor-zoom-out bg-[color:var(--image-view-overlay,rgb(0_0_0/0.6))] transition-opacity duration-300',
          grown ? 'opacity-100' : 'opacity-0',
        ]"
        @click="open = false"
      />
      <div role="dialog" aria-modal="true" :aria-label="alt" class="pointer-events-none fixed inset-0 z-50">
        <!-- The picture itself, its box growing from the thumbnail to the whole of it. -->
        <img
          :src="full"
          alt=""
          class="pointer-events-auto fixed cursor-zoom-out object-cover"
          :style="pictureStyle"
          @click="open = false"
        />
        <p
          v-if="caption"
          :class="[
            'fixed inset-x-0 px-6 text-center text-ui text-white/85',
            visible
              ? 'animate-[blur-in_0.45s_var(--ease-soft)_0.3s_both] motion-reduce:animate-none'
              : 'opacity-0 transition-opacity duration-150',
          ]"
          :style="captionStyle"
        >
          {{ caption }}
        </p>
        <button
          ref="cross"
          type="button"
          :aria-label="closeLabel"
          :class="[
            'pointer-events-auto fixed flex size-9 cursor-pointer items-center justify-center rounded-full focus-ring',
            crossOnLight ? 'text-black/70 hover:text-black' : 'text-white/85 hover:text-white',
            visible ? 'opacity-100 transition-opacity delay-200 duration-300' : 'opacity-0 duration-150',
          ]"
          :style="crossStyle"
          @click="open = false"
        >
          <XIcon aria-hidden="true" class="size-5" />
        </button>
      </div>
    </template>
  </Teleport>
</template>
