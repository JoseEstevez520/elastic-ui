import { onMounted, ref, toValue, type MaybeRefOrGetter } from 'vue'
import { useEventListener } from './useEventListener'

/** Whether the window has scrolled past `threshold` pixels. */
export function useScrolled(threshold: MaybeRefOrGetter<number>) {
  const scrolled = ref(false)
  const update = () => (scrolled.value = window.scrollY > toValue(threshold))

  onMounted(update)
  useEventListener(() => window, 'scroll', update, { passive: true })

  return scrolled
}
