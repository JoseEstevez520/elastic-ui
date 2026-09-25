<script setup lang="ts">
import { LayoutGroup, MotionConfig, motion } from 'motion-v'
import { DialogContent, DialogOverlay, DialogPortal, DialogRoot } from 'reka-ui'
import { nextTick, onBeforeUnmount, onMounted, ref, useId, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { contentOut, morphCloseTransition, morphTransition } from '../../utils/motion'
import {
  dialogMorphLabelOutClass,
  dialogMorphOverlayClass,
  dialogMorphSurfaceClass,
  dialogMorphTriggerClass,
} from './dialog-morph.variants'

/**
 * A button that becomes its dialog: the button's box travels to the middle of the screen and
 * grows into the dialog, then folds back into the button on close. Focus trap, Escape, click
 * outside, scroll lock and ARIA come from Reka UI's Dialog.
 */
const props = defineProps<{
  /** Applied to the dialog. */
  class?: HTMLAttributes['class']
}>()

const open = defineModel<boolean>('open', { default: false })
const close = () => (open.value = false)

// `open` is the intent and `lifted` whether the dialog is out. Opening lifts at once. Closing
// first fades the content, then drops the dialog, so its box morphs back into the button empty.
const lifted = ref(open.value)
watch(open, (isOpen) => {
  if (isOpen) lifted.value = true
})
// Whether the button has come back from a dialog, so its label comes into focus as it lands
// instead of on the page's first render.
const returned = ref(false)
function onContentHidden() {
  if (open.value) return
  lifted.value = false
  returned.value = true
}

// The box grows by scaling, and Motion corrects the content against it but not a scrollbar, which
// would be drawn stretched and sliding. The content only scrolls once the box has arrived.
// Timed rather than waiting for Motion's event, which never comes when there is no animation.
const settled = ref(false)
let settleTimer: ReturnType<typeof setTimeout> | undefined
function settle(isOpen: boolean) {
  clearTimeout(settleTimer)
  settled.value = false
  if (isOpen) settleTimer = setTimeout(() => (settled.value = true), morphTransition.duration * 1000)
}
watch(open, settle)
// A dialog open from the start has no change to watch; the timer waits for the browser.
onMounted(() => open.value && settle(true))
onBeforeUnmount(() => clearTimeout(settleTimer))

// Reka UI would return focus to the button that opened the dialog, which unmounted while the
// dialog was out. Focus goes to the button that lands back instead.
const trigger = useTemplateRef<{ $el: HTMLElement }>('trigger')
watch(lifted, async (isLifted) => {
  if (isLifted) return
  await nextTick()
  trigger.value?.$el.focus({ preventScroll: true })
})

const id = useId()

// Radius and edge live inline on the elements that share the `layoutId`, where Motion corrects
// them against its scale and animates between them. A CSS border would stretch mid-morph.
const triggerPaint = { borderRadius: '8px', boxShadow: '0 0 0 1px var(--color-border-strong)' }
const dialogPaint = { borderRadius: '16px', boxShadow: '0 0 0 1px var(--color-border), var(--shadow-overlay)' }
</script>

<template>
  <MotionConfig reduced-motion="user">
    <LayoutGroup>
      <DialogRoot :open="lifted" @update:open="open = $event">
        <!-- Landing back is faster than leaving (see morphCloseTransition). -->
        <motion.button
          v-if="!lifted"
          ref="trigger"
          type="button"
          aria-haspopup="dialog"
          :layout-id="`${id}-surface`"
          :transition="{ layout: morphCloseTransition }"
          :style="triggerPaint"
          :class="dialogMorphTriggerClass"
          @click="open = true"
        >
          <motion.span
            layout="position"
            :class="returned && 'animate-[blur-in_0.3s_var(--ease-soft)_0.15s_both] motion-reduce:animate-none'"
          >
            <slot name="trigger" />
          </motion.span>
        </motion.button>
        <!-- Holds the button's place while its box is out as the dialog, and lets the label fade
             out right where it was. -->
        <span v-else aria-hidden="true" :class="cn(dialogMorphTriggerClass, 'bg-transparent')">
          <span :class="dialogMorphLabelOutClass"><slot name="trigger" /></span>
        </span>

        <DialogPortal>
          <DialogOverlay :class="dialogMorphOverlayClass" />
          <div v-if="lifted" class="pointer-events-none fixed inset-0 z-50 grid place-items-center p-4">
            <DialogContent as-child @close-auto-focus.prevent>
              <motion.div
                :layout-id="`${id}-surface`"
                :transition="{ layout: morphTransition }"
                :style="dialogPaint"
                :class="cn(dialogMorphSurfaceClass, props.class)"
              >
                <!-- The content comes into focus as one wave, like every content in the library,
                     from halfway through the box's journey (as ChatMorph's): early enough to feel
                     alive, late enough that the box has slowed and nothing reads as sliding inside
                     it. Leaving, it fades before the box folds back. -->
                <motion.div
                  layout
                  :initial="false"
                  :animate="{ opacity: open ? 1 : 0, transition: open ? { duration: 0 } : contentOut }"
                  :class="
                    cn(
                      'min-h-0 overscroll-contain scrollbar-subtle stagger-children p-6 [--stagger-delay:0.25s]',
                      settled ? 'overflow-y-auto' : 'overflow-hidden',
                    )
                  "
                  @animation-complete="onContentHidden"
                >
                  <slot :close="close" />
                </motion.div>
              </motion.div>
            </DialogContent>
          </div>
        </DialogPortal>
      </DialogRoot>
    </LayoutGroup>
  </MotionConfig>
</template>
