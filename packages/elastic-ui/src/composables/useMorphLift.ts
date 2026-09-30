import { nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { morphTransition } from '../utils/motion'

/**
 * The life of a box that morphs out of its button and back (DialogMorph, CommandPalette).
 *
 * `open` is the intent and `lifted` whether the box is out. Opening lifts at once. Closing waits
 * for `hide()`, called once the content has faded, so the box morphs back into the button empty.
 * `returned` tells the button it came back from the box, so its label comes into focus as it lands
 * rather than on the page's first render; focus goes to it as well, since Reka UI would return it
 * to the button that unmounted while the box was out.
 *
 * `settled` turns true once the box has arrived: it grows by scaling, and Motion corrects the
 * content against it but not a scrollbar, which would be drawn stretched and sliding, so the
 * content only scrolls from then on. Timed rather than waiting for Motion's event, which never
 * comes when there is no animation.
 *
 * `morphs` says whether this opening grows from the button; when it does not (CommandPalette from
 * its shortcut), there is nothing to wait for and nothing to hand focus back to.
 */
export function useMorphLift(
  open: Ref<boolean>,
  button: Readonly<Ref<{ $el: HTMLElement } | null>>,
  morphs: () => boolean = () => true,
) {
  const lifted = ref(open.value)
  const returned = ref(false)
  const settled = ref(false)

  watch(open, (isOpen) => {
    if (isOpen) lifted.value = true
  })

  /** Takes the box down once its content has faded; false while it is still meant to be open. */
  function hide() {
    if (open.value) return false
    lifted.value = false
    returned.value = morphs()
    return true
  }

  let settleTimer: ReturnType<typeof setTimeout> | undefined
  function settle(isOpen: boolean) {
    clearTimeout(settleTimer)
    settled.value = false
    if (isOpen) settleTimer = setTimeout(() => (settled.value = true), morphs() ? morphTransition.duration * 1000 : 0)
  }
  watch(open, settle)
  // A box open from the start has no change to watch; the timer waits for the browser.
  onMounted(() => open.value && settle(true))
  onBeforeUnmount(() => clearTimeout(settleTimer))

  watch(lifted, async (isLifted) => {
    if (isLifted || !returned.value) return
    await nextTick()
    button.value?.$el.focus({ preventScroll: true })
  })

  return { lifted, returned, settled, hide }
}
