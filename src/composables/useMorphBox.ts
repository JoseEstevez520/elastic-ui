import { computed, nextTick, onBeforeUnmount, ref, watch, type CSSProperties, type Ref } from 'vue'
import { useEventListener } from './useEventListener'
import { contentOut, morphCloseTransition, morphTransition, prefersReducedMotion } from '../utils/motion'

/** A box on the screen, in pixels from its top left corner. */
export interface Box {
  top: number
  left: number
  width: number
  height: number
}

/** Where an element is on the screen, as a Box. */
export function boxOf(el: Element | null | undefined): Box | undefined {
  const r = el?.getBoundingClientRect()
  return r && { top: r.top, left: r.left, width: r.width, height: r.height }
}

export interface MorphBoxOptions {
  /** The intent: open or closed. */
  open: Ref<boolean>
  /** Where the box grows from, usually its button; read as it opens and again as it folds. */
  from: () => Box | undefined
  /** Where it grows to. It may wait, as for content to be laid out at its width. */
  to: () => Box | Promise<Box>
  /** What gets the focus once the box has folded back into it. */
  returnFocus?: () => HTMLElement | null | undefined
}

/**
 * The life of a box that becomes a panel and folds back, the recipe in DECISIONS ("A box that
 * becomes a panel changes its real size"), for Sheet, a card that becomes its page, and the next:
 *
 *   `shown`     the box is out at all, from the moment it opens until it has folded back;
 *   `placed`    it sits on its button's box, without moving, before it may grow;
 *   `grown`     it is (or is going) its panel's size;
 *   `visible`   its content shows: in as the box grows, out at once before it folds;
 *   `settled`   it has landed, and may scroll (keep the scrollbar's room from the start);
 *   `returned`  it has folded back, for the button's label to come into focus.
 *
 * `style(...)` is the box's own style: its place and size, and the radius (and anything else)
 * that changes with it, eased on the library's curves, longer out than back.
 */
export function useMorphBox(options: MorphBoxOptions) {
  const shown = ref(false)
  const placed = ref(false)
  const grown = ref(false)
  const visible = ref(false)
  const settled = ref(false)
  const returned = ref(false)
  const from = ref<Box>()
  const to = ref<Box>()

  let timers: ReturnType<typeof setTimeout>[] = []
  const later = (ms: number, run: () => void) => timers.push(setTimeout(run, prefersReducedMotion() ? 0 : ms))
  const clear = () => (timers.forEach(clearTimeout), (timers = []))
  onBeforeUnmount(clear)

  async function measure() {
    from.value = options.from() ?? from.value
    to.value = await options.to()
  }

  watch(options.open, async (isOpen) => {
    clear()
    if (isOpen) {
      returned.value = false
      placed.value = false
      // Its button's box before the box is out, so its first frame is already there: measured after,
      // a layout read could fix it at 0,0 and it would grow from the corner.
      from.value = options.from() ?? from.value
      shown.value = true
      await nextTick()
      await measure()
      await nextTick()
      placed.value = true
      // One frame on the button's box, then out to the panel's.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          grown.value = true
          visible.value = true
          later(morphTransition.duration * 1000, () => (settled.value = true))
        }),
      )
    } else {
      settled.value = false
      visible.value = false
      later(contentOut.duration * 1000, async () => {
        await measure()
        grown.value = false
        later(morphCloseTransition.duration * 1000, async () => {
          shown.value = false
          placed.value = false
          returned.value = true
          await nextTick()
          options.returnFocus?.()?.focus({ preventScroll: true })
        })
      })
    }
  })
  useEventListener(
    () => window,
    'resize',
    () => shown.value && measure(),
  )

  const box = computed(() => (grown.value ? to.value : from.value))

  /**
   * The box's style. `changes` are properties that go from one value on the button to another on
   * the panel, as the radius: `{ borderRadius: ['8px', '16px'] }`.
   */
  function style(changes: Record<string, [string, string]> = {}): CSSProperties {
    const b = box.value
    const t = grown.value ? morphTransition : morphCloseTransition
    const ease = `cubic-bezier(${t.ease.join(',')})`
    const properties = ['top', 'left', 'width', 'height', ...Object.keys(changes).map(kebab)]
    return {
      top: `${b?.top ?? 0}px`,
      left: `${b?.left ?? 0}px`,
      width: `${b?.width ?? 0}px`,
      height: `${b?.height ?? 0}px`,
      ...Object.fromEntries(Object.entries(changes).map(([k, [rest, out]]) => [k, grown.value ? out : rest])),
      transition:
        !placed.value || prefersReducedMotion()
          ? 'none'
          : properties.map((p) => `${p} ${t.duration}s ${ease}`).join(','),
    }
  }

  return { shown, placed, grown, visible, settled, returned, from, to, box, style, measure }
}

const kebab = (name: string) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
