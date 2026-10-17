import { onMounted, ref, watch, type WatchSource } from 'vue'

/**
 * False until `source` changes after mount, then true for good. Entrances wait for it, so
 * something open when the page loads just shows, and only a change made afterwards plays. Tied to
 * the change itself rather than to time: an animation plays whenever its class first applies, so a
 * class added a frame after mount would still play on load. Changes made while setting up (a
 * group opening to show the active item inside) happen before mount and don't count. Set before
 * the render that shows the change, so the class and the new state arrive together.
 */
export function useHasChanged(source: WatchSource) {
  const changed = ref(false)
  onMounted(() => {
    const stop = watch(source, () => {
      changed.value = true
      stop()
    })
  })
  return changed
}
