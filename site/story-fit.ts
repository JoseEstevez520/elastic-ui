import { onBeforeUnmount, onMounted, ref, watch, type Ref, type WatchSource } from 'vue'

const OPEN = '[aria-expanded="true"], [data-state="open"]'
// Below this a story is shrunk no further: smaller than this it is no longer worth reading.
const MIN_ZOOM = 0.5

/** Whether an element puts something on screen of its own: text, a fill, an edge, a shadow, media. */
function paints(el: Element, style: CSSStyleDeclaration) {
  if (el instanceof SVGElement || el instanceof HTMLImageElement || el instanceof HTMLCanvasElement) return true
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true
  if ([...el.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())) return true
  if (style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent') return true
  if (style.backgroundImage !== 'none' || style.boxShadow !== 'none') return true
  return ['Top', 'Right', 'Bottom', 'Left'].some(
    (side) => parseFloat(style.getPropertyValue(`border-${side.toLowerCase()}-width`)) > 0,
  )
}

/** The box around everything the story paints, inside `content`, relative to it. */
function paintedBox(content: HTMLElement) {
  const origin = content.getBoundingClientRect()
  let left = Infinity
  let top = Infinity
  let right = -Infinity
  let bottom = -Infinity
  for (const el of content.querySelectorAll('*')) {
    // An svg's own parts are inside its box already.
    if (el.parentElement?.closest('svg')) continue
    const style = getComputedStyle(el)
    if (style.visibility === 'hidden' || style.opacity === '0' || !paints(el, style)) continue
    const rect = el.getBoundingClientRect()
    if (rect.width < 1 || rect.height < 1) continue
    // What sits beyond the frame (a marquee's band, a carousel's next slides) is clipped there.
    left = Math.min(left, Math.max(rect.left, origin.left) - origin.left)
    right = Math.max(right, Math.min(rect.right, origin.right) - origin.left)
    top = Math.min(top, rect.top - origin.top)
    bottom = Math.max(bottom, rect.bottom - origin.top)
  }
  return right > left ? { left, top, width: right - left, height: bottom - top } : undefined
}

/**
 * Fits a story to its frame, whatever the part, with nothing set by hand: a story wider than the
 * frame (a toolbar on a phone) is shrunk until it fits, and one that leaves the frame mostly empty
 * (a button, a badge) is centred in it, across and, when shorter than the frame's least height,
 * down. The story itself is never laid out differently: it keeps the full width a page would give it,
 * so a part that fills its container still does, and only room it leaves empty is shared out.
 *
 * Measured at rest only, when the story mounts and when the frame's width changes, never while
 * something in it is open: a panel opening moves nothing that was already there, so its motion can
 * be judged (the frame grows to hold it, see fitted-height.ts).
 */
export function useStoryFit(
  frame: Ref<HTMLElement | undefined>,
  content: Ref<HTMLElement | undefined>,
  minHeight: () => number,
  remeasureOn: WatchSource,
) {
  const zoom = ref(1)
  const offsetX = ref(0)
  const offsetY = ref(0)

  function measure() {
    const box = frame.value
    const el = content.value
    if (!box || !el || box.querySelector(OPEN)) return
    // Measured from scratch each time, in one go, so the neutral layout is never painted.
    el.style.zoom = '1'
    el.style.paddingInlineStart = '0px'
    el.style.paddingTop = '0px'
    const fits = el.scrollWidth <= el.clientWidth + 1
    const nextZoom = fits ? 1 : Math.max(MIN_ZOOM, el.clientWidth / el.scrollWidth)
    el.style.zoom = String(nextZoom)
    const painted = paintedBox(el)
    let x = 0
    let y = 0
    if (painted && nextZoom === 1) {
      const room = el.clientWidth - painted.width
      // Centred only when it leaves real room either side; a part that fills the frame stays put.
      if (room > 24) x = Math.max(0, room / 2 - painted.left)
      const padding = parseFloat(getComputedStyle(box).paddingTop) * 2
      const inner = minHeight() - padding
      if (painted.height < inner) y = Math.max(0, (inner - painted.height) / 2 - painted.top)
    }
    zoom.value = nextZoom
    offsetX.value = Math.round(x)
    offsetY.value = Math.round(y)
    el.style.zoom = ''
    el.style.paddingInlineStart = ''
    el.style.paddingTop = ''
  }

  let raf = 0
  const schedule = () => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(measure)
  }

  // A story can still be settling a moment after it mounts (fonts, an image, a part measuring
  // itself), so it is measured again once things have landed.
  let settle: ReturnType<typeof setTimeout> | undefined
  const fit = () => {
    schedule()
    clearTimeout(settle)
    settle = setTimeout(schedule, 400)
  }
  watch(remeasureOn, fit, { flush: 'post' })

  let width = 0
  let observer: ResizeObserver | undefined
  onMounted(() => {
    fit()
    document.fonts?.ready.then(schedule)
    observer = new ResizeObserver(([entry]) => {
      const next = Math.round(entry?.contentRect.width ?? 0)
      if (next === width) return
      width = next
      fit()
    })
    if (frame.value) observer.observe(frame.value)
  })
  onBeforeUnmount(() => {
    observer?.disconnect()
    cancelAnimationFrame(raf)
    clearTimeout(settle)
  })

  return { zoom, offsetX, offsetY }
}
