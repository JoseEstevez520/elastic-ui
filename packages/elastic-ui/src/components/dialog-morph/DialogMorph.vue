<script setup lang="ts">
import { LayoutGroup, MotionConfig, motion } from 'motion-v'
import { DialogContent, DialogOverlay, DialogPortal, DialogRoot } from 'reka-ui'
import { useId, useTemplateRef, type HTMLAttributes } from 'vue'
import { useMorphLift } from '../../composables/useMorphLift'
import { usePortalTarget } from '../../composables/usePortalTarget'
import { cn } from '../../utils/cn'
import { contentOut, morphCloseTransition, morphTransition } from '../../utils/motion'
import {
  dialogMorphLabelOutClass,
  dialogMorphOverlayClass,
  dialogMorphSurfaceClass,
  dialogMorphTriggerClass,
  morphSurfacePaint,
  morphTriggerPaint,
} from './dialog-morph.variants'

/**
 * A button that becomes its dialog: the button's box travels to the middle of the screen and
 * grows into the dialog, then folds back into the button on close. Focus trap, Escape, click
 * outside, scroll lock and ARIA come from Reka UI's Dialog.
 */
const props = defineProps<{
  /**
   * Asks something that needs an answer, such as confirming a deletion (`role="alertdialog"`): a
   * click outside does not close it; only its buttons and Escape do.
   */
  alert?: boolean
  /** Applied to the dialog. */
  class?: HTMLAttributes['class']
}>()

const open = defineModel<boolean>('open', { default: false })
const close = () => (open.value = false)

// Out and back, settling and handing focus back to the button (see useMorphLift).
const trigger = useTemplateRef<{ $el: HTMLElement }>('trigger')
const { lifted, returned, settled, hide } = useMorphLift(open, trigger)

const id = useId()
const portalTo = usePortalTarget()

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
          :style="morphTriggerPaint"
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

        <DialogPortal :to="portalTo">
          <DialogOverlay :class="dialogMorphOverlayClass" />
          <div v-if="lifted" class="pointer-events-none fixed inset-0 z-50 grid place-items-center p-4">
            <DialogContent
              as-child
              :role="alert ? 'alertdialog' : 'dialog'"
              @close-auto-focus.prevent
              @interact-outside="alert && $event.preventDefault()"
            >
              <motion.div
                :layout-id="`${id}-surface`"
                :transition="{ layout: morphTransition }"
                :style="morphSurfacePaint"
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
                      // The scrollbar's room is kept from the start, so nothing narrows as it lands.
                      '[scrollbar-gutter:stable]',
                      settled ? 'overflow-y-auto' : 'overflow-hidden',
                    )
                  "
                  @animation-complete="hide"
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
