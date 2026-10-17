import { nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref, type WatchSource } from 'vue'

/**
 * Whether an element's content runs past it, to end it in a fading edge only when it does (see
 * `mask-fade-r`). Measured as the element resizes, and as `content` changes: text growing in a box
 * already at its widest does not resize it. For a line of its own, `TruncatedText` does this itself.
 */
export function useTruncated(el: Readonly<Ref<HTMLElement | null>>, content?: WatchSource) {
  const truncated = ref(false)
  const measure = () => {
    const node = el.value
    truncated.value = !!node && node.scrollWidth > node.clientWidth + 1
  }
  let observer: ResizeObserver | undefined
  onMounted(() => {
    observer = new ResizeObserver(measure)
    if (el.value) observer.observe(el.value)
    measure()
  })
  if (content) watch(content, () => nextTick(measure))
  onBeforeUnmount(() => observer?.disconnect())
  return truncated
}
