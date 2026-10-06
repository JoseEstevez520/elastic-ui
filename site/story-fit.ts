import { onBeforeUnmount, onMounted, watch, type Ref, type WatchSource } from 'vue'

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

/**
 * The box around everything the story paints, relative to `content`, as far as it can be seen: what
 * a part clips itself (a marquee's band, a carousel's next slides) counts only up to its clip, and
 * what paints nothing (the room a Liquid keeps for its drops) does not count at all.
 */
function paintedBox(content: HTMLElement) {
  const origin = content.getBoundingClientRect()
  // Each element's clip: none, its own box, or `false` when it hides all it holds (`sr-only`, a
  // table for screen readers cut down to nothing by its `clip-path`).
  const clips = new Map<Element, DOMRect | null | false>()
  const clipOf = (el: Element) => {
    if (!clips.has(el)) {
      const style = getComputedStyle(el)
      const hidden = style.clipPath === 'inset(50%)' || style.clip === 'rect(0px, 0px, 0px, 0px)'
      const visible = style.overflowX === 'visible' && style.overflowY === 'visible'
      clips.set(el, hidden ? false : visible ? null : el.getBoundingClientRect())
    }
    return clips.get(el)!
  }
  let left = Infinity
  let top = Infinity
  let right = -Infinity
  let bottom = -Infinity
  for (const el of content.querySelectorAll('*')) {
    // An svg's own parts are inside its box already.
    if (el.parentElement?.closest('svg')) continue
    // Hidden by itself or by what holds it (a tooltip waiting at opacity 0) is not seen.
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue
    const style = getComputedStyle(el)
    if (!paints(el, style)) continue
    const rect = el.getBoundingClientRect()
    let [l, t, r, b] = [rect.left, rect.top, rect.right, rect.bottom]
    if (clipOf(el) === false) continue
    for (let up = el.parentElement; up && up !== content; up = up.parentElement) {
      const clip = clipOf(up)
      if (clip === false) r = l
      if (!clip) continue
      l = Math.max(l, clip.left)
      t = Math.max(t, clip.top)
      r = Math.min(r, clip.right)
      b = Math.min(b, clip.bottom)
    }
    if (r - l < 1 || b - t < 1) continue
    left = Math.min(left, l - origin.left)
    right = Math.max(right, r - origin.left)
    top = Math.min(top, t - origin.top)
    bottom = Math.max(bottom, b - origin.top)
  }
  return right > left ? { left, top, right, width: right - left, height: bottom - top } : undefined
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
  function measure() {
    const box = frame.value
    const el = content.value
    if (!box || !el || box.querySelector(OPEN)) return
    // Measured from scratch each time, in one go, so the neutral layout is never painted.
    el.style.zoom = '1'
    el.style.paddingInlineStart = '0px'
    el.style.paddingTop = '0px'
    const width = el.clientWidth
    const painted = paintedBox(el)
    // How wide the story is to the eye, from the frame's start or from wherever it starts before it.
    const extent = painted ? Math.max(painted.right, width) - Math.min(painted.left, 0) : width
    const nextZoom = extent <= width + 1 ? 1 : Math.max(MIN_ZOOM, width / extent)
    el.style.zoom = String(nextZoom)
    // What is left over once shrunk as far as it goes, for the site's check (scripts/check-frames.mjs).
    el.dataset.overflow = String(Math.max(0, Math.round(extent * nextZoom - width)))
    el.dataset.zoom = nextZoom.toFixed(2)
    let x = 0
    let y = 0
    if (painted && nextZoom === 1) {
      const room = width - painted.width
      // Centred only when it leaves real room either side; a part that fills the frame stays put.
      if (room > 24) x = Math.max(0, room / 2 - painted.left)
      const padding = parseFloat(getComputedStyle(box).paddingTop) * 2
      const inner = minHeight() - padding
      if (painted.height < inner) y = Math.max(0, (inner - painted.height) / 2 - painted.top)
    }
    // Written straight onto the element, which owns them: nothing else sets these.
    el.style.paddingInlineStart = `${Math.round(x)}px`
    el.style.paddingTop = `${Math.round(y)}px`
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

}
