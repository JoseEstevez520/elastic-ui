<script setup lang="ts">
import { LayoutGroup, MotionConfig, motion } from 'motion-v'
import { DialogContent, DialogOverlay, DialogPortal, DialogRoot } from 'reka-ui'
import { computed, onBeforeUnmount, ref, useId, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { provideFieldRoom } from '../../composables/useFieldRoom'
import { useMorphLift } from '../../composables/useMorphLift'
import { usePortalTarget } from '../../composables/usePortalTarget'
import { cn } from '../../utils/cn'
import { contentOut, morphCloseTransition, morphTransition, prefersReducedMotion, useReducedMotion } from '../../utils/motion'
import {
  dialogMorphBodyClass,
  dialogMorphLabelOutClass,
  dialogMorphMeasuredClass,
  dialogMorphOverlayClass,
  dialogMorphResizeClass,
  dialogMorphResizeDuration,
  dialogMorphSurfaceClass,
  dialogMorphTriggerVariants,
  morphGhostTriggerPaint,
  morphSurfacePaint,
  morphTriggerPaint,
  type DialogMorphTriggerVariants,
} from './dialog-morph.variants'

// The app's motion preference (setMotionPreference), not only the system's.
const reducedMotion = useReducedMotion()

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
  /** The button's look at rest: `outline` (the default), or `ghost` for a row of quiet actions. */
  variant?: DialogMorphTriggerVariants['variant']
  /** `icon` for a square button holding only an icon, which then needs an accessible name. */
  size?: DialogMorphTriggerVariants['size']
  /** Applied to the dialog. */
  class?: HTMLAttributes['class']
}>()

const open = defineModel<boolean>('open', { default: false })
const close = () => (open.value = false)

// Out and back, settling and handing focus back to the button (see useMorphLift).
const trigger = useTemplateRef<{ $el: HTMLElement }>('trigger')
const { lifted, returned, settled, hide } = useMorphLift(open, trigger)

const id = useId()
const triggerClass = computed(() => dialogMorphTriggerVariants({ variant: props.variant, size: props.size }))
const triggerPaint = computed(() => (props.variant === 'ghost' ? morphGhostTriggerPaint : morphTriggerPaint))
const portalTo = usePortalTarget()

// While it is open, a change of content (fields that come and go) eases the box's real height, as
// a box that becomes a panel does: the content stays put, uncovered or covered by the box's edge.
// The box only morphs when it comes out or goes back (every `layout-dependency="lifted"` below), so
// Motion never scales it to the new height, which would stretch the text. The height is measured
// from the content, unset until then so the box opens at its size.
const body = useTemplateRef<HTMLElement>('body')
const height = ref<number>()
const resizing = ref(false)
let observer: ResizeObserver | undefined
let resizeTimer: ReturnType<typeof setTimeout> | undefined
watch(body, (el) => {
  observer?.disconnect()
  height.value = undefined
  if (!el) return
  observer = new ResizeObserver(([entry]) => {
    const next = entry.borderBoxSize[0].blockSize
    if (height.value !== undefined && next !== height.value && settled.value) {
      // Clipped while it eases, so a scrollbar never flashes on a box still on its way.
      resizing.value = true
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => (resizing.value = false), prefersReducedMotion() ? 0 : dialogMorphResizeDuration)
    }
    height.value = next
  })
  observer.observe(el)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  clearTimeout(resizeTimer)
})

// A field that opens inside (a Select's list) reaches past the content: the box grows to hold it,
// as it does for any other content, and scrolls it into view when it is already at its tallest.
const spacer = useTemplateRef<HTMLElement>('spacer')
const { room } = provideFieldRoom({
  spacer,
  scroller: () => body.value?.parentElement,
  space: () => window.innerHeight * 0.85,
  settle: dialogMorphResizeDuration,
})
</script>

<template>
  <MotionConfig :reduced-motion="reducedMotion">
    <LayoutGroup>
      <DialogRoot :open="lifted" @update:open="open = $event">
        <!-- Landing back is faster than leaving (see morphCloseTransition). -->
        <motion.button
          v-if="!lifted"
          ref="trigger"
          type="button"
          aria-haspopup="dialog"
          :layout-id="`${id}-surface`"
          :layout-dependency="lifted"
          :transition="{ layout: morphCloseTransition }"
          :style="triggerPaint"
          :class="triggerClass"
          @click="open = true"
        >
          <motion.span
            layout="position"
            :layout-dependency="lifted"
            :class="returned && 'animate-[blur-in_0.3s_var(--ease-soft)_0.15s_both] motion-reduce:animate-none'"
          >
            <slot name="trigger" />
          </motion.span>
        </motion.button>
        <!-- Holds the button's place while its box is out as the dialog, and lets the label fade
             out right where it was. -->
        <span v-else aria-hidden="true" :class="cn(triggerClass, 'bg-transparent')">
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
                :layout-dependency="lifted"
                :transition="{ layout: morphTransition }"
                :style="height === undefined ? morphSurfacePaint : { ...morphSurfacePaint, '--dialog-content-height': `${height}px` }"
                :class="
                  cn(
                    dialogMorphSurfaceClass,
                    height !== undefined && dialogMorphMeasuredClass,
                    settled && dialogMorphResizeClass,
                    props.class,
                  )
                "
              >
                <!-- The content comes into focus as one wave, like every content in the library,
                     from halfway through the box's journey (as ChatMorph's): early enough to feel
                     alive, late enough that the box has slowed and nothing reads as sliding inside
                     it. Leaving, it fades before the box folds back. -->
                <motion.div
                  layout
                  :layout-dependency="lifted"
                  :initial="false"
                  :animate="{ opacity: open ? 1 : 0, transition: open ? { duration: 0 } : contentOut }"
                  :class="
                    cn(
                      'min-h-0 overscroll-contain scrollbar-subtle',
                      // The scrollbar's room is kept from the start, so nothing narrows as it lands.
                      '[scrollbar-gutter:stable]',
                      settled && !resizing ? 'overflow-y-auto' : 'overflow-hidden',
                    )
                  "
                  @animation-complete="hide"
                >
                  <div ref="body" :class="dialogMorphBodyClass">
                    <slot :close="close" />
                    <div ref="spacer" aria-hidden="true" :style="{ height: `${room}px` }" />
                  </div>
                </motion.div>
              </motion.div>
            </DialogContent>
          </div>
        </DialogPortal>
      </DialogRoot>
    </LayoutGroup>
  </MotionConfig>
</template>
