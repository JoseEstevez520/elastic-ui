import { nextTick, onBeforeUnmount, ref, type Ref } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { contentOut, prefersReducedMotion } from '../../utils/motion'

/**
 * Lab: the open state both radial alternatives share, as SplitActions has it: the trigger toggles,
 * the first action takes the focus, Escape or a click elsewhere closes; closing, the icons go
 * first (`showing`) and the shape folds after (`open`).
 */
export function useSplitOpen(root: Ref<HTMLElement | null>, trigger: Ref<HTMLButtonElement | null>) {
  const open = ref(false)
  const showing = ref(false)
  const buttons = ref<HTMLButtonElement[]>([])
  let timer: ReturnType<typeof setTimeout> | undefined
  onBeforeUnmount(() => clearTimeout(timer))

  // Opened from the keyboard, the first action takes the focus; by pointer it does not, so nothing
  // lights up or shows its tooltip before the pointer gets there.
  async function show(fromKeyboard: boolean) {
    clearTimeout(timer)
    open.value = true
    showing.value = true
    await nextTick()
    if (fromKeyboard) buttons.value[0]?.focus({ preventScroll: true })
  }
  function close(focusTrigger = true) {
    if (!open.value) return
    showing.value = false
    clearTimeout(timer)
    timer = setTimeout(() => (open.value = false), prefersReducedMotion() ? 0 : contentOut.duration * 1000)
    if (focusTrigger) trigger.value?.focus({ preventScroll: true })
  }
  // A click from the keyboard (Enter, Space) has no pointer: `detail` is 0.
  const toggle = (e?: MouseEvent) => (open.value && showing.value ? close() : show(!e || e.detail === 0))
  function onKey(e: KeyboardEvent, i: number) {
    const n = buttons.value.length
    const step =
      e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    e.preventDefault()
    buttons.value[(i + step + n) % n]?.focus()
  }
  useEventListener<KeyboardEvent>(
    () => document,
    'keydown',
    (e) => e.key === 'Escape' && close(),
  )
  useEventListener<PointerEvent>(
    () => document,
    'pointerdown',
    (e) => {
      if (open.value && e.target instanceof Node && !root.value?.contains(e.target)) close(false)
    },
  )
  return { open, showing, buttons, toggle, close, onKey }
}
