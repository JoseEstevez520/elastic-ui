import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

const OPEN = '[aria-expanded="true"], [data-state="open"]'

/**
 * A frame that grows to hold the panel a story opens, and folds back once it closes. The box keeps
 * its base height at rest; while something inside is open, it grows just enough to show it, so a
 * date's calendar or a field's list is never cut off by the frame. Shrinking waits a touch, so the
 * closing panel is not clipped on its way out.
 */
export function useFittedHeight(frame: Ref<HTMLElement | undefined>, base: () => number, extra = 16) {
  const fitted = ref(base())
  let shrink: ReturnType<typeof setTimeout> | undefined
  let raf = 0

  function measure() {
    const el = frame.value
    if (!el) return
    if (!el.querySelector(OPEN)) {
      clearTimeout(shrink)
      shrink = setTimeout(() => (fitted.value = base()), 320)
      return
    }
    clearTimeout(shrink)
    const top = el.getBoundingClientRect().top
    let bottom = 0
    for (const node of el.querySelectorAll('*')) {
      const rect = node.getBoundingClientRect()
      if (rect.height > 0) bottom = Math.max(bottom, rect.bottom - top)
    }
    fitted.value = Math.max(base(), Math.round(bottom + extra))
  }

  const schedule = () => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(measure)
  }

  let observer: MutationObserver | undefined
  onMounted(() => {
    observer = new MutationObserver(schedule)
    if (frame.value)
      observer.observe(frame.value, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['data-state', 'aria-expanded'],
      })
  })
  onBeforeUnmount(() => {
    observer?.disconnect()
    cancelAnimationFrame(raf)
    clearTimeout(shrink)
  })

  return fitted
}
