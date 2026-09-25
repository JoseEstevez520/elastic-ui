import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

// How many replays on the page are playing, shared by all of them.
const playingNow = ref(0)

/**
 * For parts that play something back (AgentReplay, TerminalReplay): starts it the first time it
 * comes into view, but only one plays at a time. With several on screen, the next waits for the
 * one playing to finish, so one thing leads.
 */
export function usePlayInTurn(root: Readonly<Ref<HTMLElement | null>>, playing: Readonly<Ref<boolean>>, start: () => void) {
  const inView = ref(false)
  let started = false

  watch(playing, (now, before) => {
    if (now && !before) playingNow.value++
    if (!now && before) playingNow.value--
  })
  watch([inView, playingNow], () => {
    if (started || !inView.value || playingNow.value > 0) return
    started = true
    start()
  })

  let observer: IntersectionObserver | undefined
  onMounted(() => {
    observer = new IntersectionObserver(([entry]) => (inView.value = !!entry?.isIntersecting), { threshold: 0.5 })
    if (root.value) observer.observe(root.value)
  })
  onBeforeUnmount(() => {
    observer?.disconnect()
    if (playing.value) playingNow.value--
  })

  /** Whether it has played on its own yet. */
  return { hasStarted: () => started }
}
