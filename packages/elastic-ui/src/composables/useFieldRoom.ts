import { computed, inject, onBeforeUnmount, provide, reactive, ref, type InjectionKey, type Ref } from 'vue'
import { prefersReducedMotion } from '../utils/motion'

/**
 * Room for fields that open (Select, Combobox, DatePicker) inside a box that clips and scrolls its
 * content (DialogMorph, Sheet, SheetFlow, PopoverMorph). An open field's outline is drawn over what
 * follows it, out of the flow, so the box neither grew for it nor scrolled to it, and its edge cut
 * the list off. The box keeps a spacer at the end of its content, as tall as the open field reaches
 * past it, so its own height or scroll takes the field in (a dialog eases to its new height, as for
 * any change of content), and once it has, it scrolls its own content to bring the field into view.
 */
interface FieldRoom {
  /**
   * Where the open field's bottom is on the screen; `undefined` gives the room back. With its top,
   * the first time it opens, the box also scrolls it into view once it has made the room.
   */
  claim: (id: symbol, bottom: number | undefined, top?: number) => void
  /** The most of the box's content in view at once, less its padding: what a field may fill. */
  space: () => number
}

const key: InjectionKey<FieldRoom> = Symbol('field-room')

export interface FieldRoomOptions {
  /** The spacer, last in the box's content, after everything the content lays out. */
  spacer: Ref<HTMLElement | null | undefined>
  /** What scrolls the content. */
  scroller: () => HTMLElement | null | undefined
  /** The most the box shows of its content at once, the height it grows to at most (px). */
  space: () => number
  /** How long the box takes to take the new room, before it scrolls the field into view (ms). */
  settle?: number
}

/** For a box that clips its content: `room` is its spacer's height. */
export function provideFieldRoom(options: FieldRoomOptions) {
  // Below the spacer's top, in pixels: unchanged by scrolling, since both move together.
  const reach = reactive(new Map<symbol, number>())
  const room = computed(() => Math.max(0, ...reach.values()))
  let timer: ReturnType<typeof setTimeout> | undefined
  onBeforeUnmount(() => clearTimeout(timer))

  // Scroll only the box's own content (see "The page jumps when a part mounts"), and never so far
  // that the field's own row leaves the top.
  function reveal(bottom: number, top: number) {
    const scroller = options.scroller()
    const spacer = options.spacer.value
    if (!scroller || !spacer) return
    const pad = parseFloat(getComputedStyle(spacer.parentElement ?? spacer).paddingBottom) || 0
    const view = scroller.getBoundingClientRect()
    const below = bottom + pad - view.bottom
    const above = top - view.top
    const by = Math.min(below, above)
    if (by > 0)
      scroller.scrollTo({ top: scroller.scrollTop + by, behavior: prefersReducedMotion() ? 'instant' : 'smooth' })
  }

  provide(key, {
    claim(id, bottom, top) {
      const spacer = options.spacer.value
      if (bottom === undefined || !spacer) return void reach.delete(id)
      const start = spacer.getBoundingClientRect().top
      reach.set(id, bottom - start)
      if (top === undefined) return
      // Once the box has taken the room, from where things are then (its height and scroll may
      // have changed) and how far the field reaches then (its panel may have been laid out since).
      const fromTop = top - start
      clearTimeout(timer)
      timer = setTimeout(
        () => {
          const now = options.spacer.value?.getBoundingClientRect().top
          const fromBottom = reach.get(id)
          if (now !== undefined && fromBottom !== undefined) reveal(now + fromBottom, now + fromTop)
        },
        prefersReducedMotion() ? 0 : (options.settle ?? 0),
      )
    },
    space() {
      const content = options.spacer.value?.parentElement
      const style = content && getComputedStyle(content)
      const pads = style ? (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0) : 0
      return options.space() - pads
    },
  })
  return { room }
}

/**
 * For a field that opens: tells the box round it, if any, how far down it reaches while open, and
 * asks how much room its panel may take.
 */
export function useFieldRoom() {
  const host = inject(key, undefined)
  const id = Symbol('field')
  const space = ref<number>()
  onBeforeUnmount(() => host?.claim(id, undefined))
  return {
    /** The open field's bottom on the screen, and its top the first time it opens (see FieldRoom). */
    claim: (bottom: number | undefined, top?: number) => host?.claim(id, bottom, top),
    /** Reads the room the box has, for the panel's height cap; `undefined` outside such a box. */
    measureSpace: () => (space.value = host?.space()),
    space,
  }
}
