import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

// How many replays on the page are playing, shared by all of them.
const playingNow = ref(0)

/**
 * For parts that play something back (AgentReplay, TerminalReplay): starts it the first time it is
 * in full view (or fills most of the screen, when it is taller), and a moment after, so the eye has
 * landed on it before anything moves. Only one plays at a time. With several on screen, the next waits for the
 * one playing to finish, so one thing leads.
 */
export function usePlayInTurn(root: Readonly<Ref<HTMLElement | null>>, playing: Readonly<Ref<boolean>>, start: () => void) {
  const inView = ref(false)
  let started = false

  watch(playing, (now, before) => {
    if (now && !before) playingNow.value++
    if (!now && before) playingNow.value--
  })
  // A beat after it is in view, and not at all if it is scrolled past in the meantime.
  const LAND = 450
  let landing: ReturnType<typeof setTimeout> | undefined
  watch([inView, playingNow], () => {
    clearTimeout(landing)
    if (started || !inView.value || playingNow.value > 0) return
    landing = setTimeout(() => {
      if (started || !inView.value || playingNow.value > 0) return
      started = true
      start()
    }, LAND)
  })

  let observer: IntersectionObserver | undefined
  onMounted(() => {
    const el = root.value
    if (!el) return
    // In full view: nine tenths of it on screen, or, when it is taller than the screen, enough of it
    // to fill most of it.
    const needed = Math.min(0.9, (window.innerHeight * 0.85) / Math.max(1, el.offsetHeight))
    observer = new IntersectionObserver(([entry]) => (inView.value = (entry?.intersectionRatio ?? 0) >= needed - 0.01), {
      threshold: [0, needed],
    })
    observer.observe(el)
  })
  onBeforeUnmount(() => {
    clearTimeout(landing)
    observer?.disconnect()
    if (playing.value) playingNow.value--
  })

  /** Whether it has played on its own yet. */
  return { hasStarted: () => started }
}
