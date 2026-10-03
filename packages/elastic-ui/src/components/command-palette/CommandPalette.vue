<script setup lang="ts">
import { LayoutGroup, MotionConfig, motion } from 'motion-v'
import { DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle, ListboxRoot, VisuallyHidden } from 'reka-ui'
import { computed, ref, useId, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { SearchIcon } from '../../icons/internal'
import { useEventListener } from '../../composables/useEventListener'
import { useMorphLift } from '../../composables/useMorphLift'
import { usePortalTarget } from '../../composables/usePortalTarget'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import { contentOut, EASE_EMPHASIZED, morphCloseTransition, morphTransition, useReducedMotion } from '../../utils/motion'
import {
  dialogMorphLabelOutClass,
  dialogMorphOverlayClass,
  morphSurfacePaint,
  morphTriggerPaint,
} from '../dialog-morph/dialog-morph.variants'
import { provideCommandPaletteContext, useCommandRegistry } from './command-palette.context'
import {
  commandPositionerClass,
  commandSurfaceClass,
  commandTriggerClass,
} from './command-palette.variants'

// The app's motion preference (setMotionPreference), not only the system's.
const reducedMotion = useReducedMotion()

/**
 * A search over the app's commands and pages. Opened from its button, the button's box grows into
 * the palette as DialogMorph's does. Opened with its shortcut, when it has one, or from outside,
 * there is nothing it comes from: the button stays put and the palette appears near the top as a Popover does, fading in from 97%.
 * It leaves the way it came. Focus trap, Escape, click outside and scroll lock come from Reka
 * UI's Dialog; the list's keyboard and ARIA from its Listbox.
 */
const props = withDefaults(
  defineProps<{
    /** The button's label and the palette's accessible name. */
    label?: string
    /** `false` leaves no button: opened with its shortcut or `v-model:open`. */
    trigger?: boolean
    /** Opens it from anywhere on the page: `mod+k` for ⌘K / Ctrl+K (which also closes it), or `/`. */
    shortcut?: 'mod+k' | '/'
    /** Applied to the palette. */
    class?: HTMLAttributes['class']
  }>(),
  { label: labelFor('search'), trigger: true },
)

const open = defineModel<boolean>('open', { default: false })
const query = defineModel<string>('query', { default: '' })
const close = () => (open.value = false)
const portalTo = usePortalTarget()

// Where it opened from: its button (a morph) or anywhere else (a fade). Set on every opening, and
// kept until it has closed, so it leaves the way it came.
const fromTrigger = ref(false)
let clicked = false
function openFromTrigger() {
  clicked = true
  open.value = true
}

// Runs before useMorphLift's own watch, so each opening knows where it came from as it lifts.
watch(open, (isOpen) => {
  if (!isOpen) return
  fromTrigger.value = clicked && props.trigger
  clicked = false
})

// Out and back, settling and handing focus back to the button (see useMorphLift).
const button = useTemplateRef<{ $el: HTMLElement }>('button')
const { lifted, returned, settled, hide } = useMorphLift(open, button, () => fromTrigger.value)
function onHidden() {
  if (hide()) query.value = ''
}

// The first result is ready for Enter as soon as the palette opens.
const listbox = useTemplateRef<{ highlightFirstItem: () => void; highlightItem: (value: unknown) => void }>('listbox')
watch(listbox, (root) => root?.highlightFirstItem())

// Reka UI drops the highlight when the pointer leaves the list, which also happens when the list
// shrinks away from under a still pointer as the query narrows it. Enter would then do nothing,
// so the highlight stays, as in cmdk and Raycast: on the same item, or the first one left.
let highlighted: { ref: HTMLElement; value: unknown } | undefined
function onLeave() {
  if (highlighted?.ref.isConnected) listbox.value?.highlightItem(highlighted.value)
  else listbox.value?.highlightFirstItem()
}

// ⌘K toggles it, as in Linear and Raycast; `/` only opens it, and never while typing elsewhere.
useEventListener<KeyboardEvent>(() => document, 'keydown', (event) => {
  if (!props.shortcut) return
  const typing = event.target instanceof HTMLElement && event.target.closest('input, textarea, [contenteditable]')
  if (props.shortcut === 'mod+k' && event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault()
    open.value = !open.value
  } else if (props.shortcut === '/' && event.key === '/' && !typing && !open.value) {
    event.preventDefault()
    open.value = true
  }
})

const registry = useCommandRegistry()
provideCommandPaletteContext({ query, settled, close, ...registry })

const id = useId()

// Opened with the shortcut there is no box to come from: the palette fades in from 97% as a
// Popover does, and leaves faster, barely shrinking.
const appear = computed(() =>
  fromTrigger.value
    ? {}
    : open.value
      ? { opacity: 1, scale: 1, transition: { duration: 0.25, ease: EASE_EMPHASIZED } }
      : { opacity: 0, scale: 0.99, transition: { duration: 0.15, ease: EASE_EMPHASIZED } },
)
function onSurfaceDone() {
  if (!fromTrigger.value) onHidden()
}
function onContentDone() {
  if (fromTrigger.value) onHidden()
}

// Every `layout-dependency="lifted"` below: the boxes only morph when the palette comes out or goes
// back. Any other change of size just happens, such as the list easing its own height while
// filtering, instead of the box being scaled to it.

</script>

<template>
  <MotionConfig :reduced-motion="reducedMotion">
    <LayoutGroup>
      <DialogRoot :open="lifted" @update:open="open = $event">
        <template v-if="trigger">
          <motion.button
            v-if="!lifted || !fromTrigger"
            ref="button"
            type="button"
            aria-haspopup="dialog"
            :layout-id="`${id}-surface`"
            :layout-dependency="lifted"
            :transition="{ layout: morphCloseTransition }"
            :style="morphTriggerPaint"
            :class="commandTriggerClass"
            @click="openFromTrigger"
          >
            <motion.span
              layout="position"
              :layout-dependency="lifted"
              :class="
                cn(
                  'inline-flex items-center gap-2',
                  returned && 'animate-[blur-in_0.3s_var(--ease-soft)_0.15s_both] motion-reduce:animate-none',
                )
              "
            >
              <slot name="trigger">
                <SearchIcon aria-hidden="true" class="size-4" />
                {{ label }}
              </slot>
            </motion.span>
          </motion.button>
          <!-- Holds the button's place while its box is out as the palette. -->
          <span v-else aria-hidden="true" :class="cn(commandTriggerClass, 'bg-transparent')">
            <span :class="cn('inline-flex items-center gap-2', dialogMorphLabelOutClass)">
              <slot name="trigger">
                <span class="size-4" />
                {{ label }}
              </slot>
            </span>
          </span>
        </template>

        <DialogPortal :to="portalTo">
          <DialogOverlay :class="dialogMorphOverlayClass" />
          <div v-if="lifted" :class="commandPositionerClass">
            <DialogContent as-child :aria-describedby="undefined" @close-auto-focus="fromTrigger && $event.preventDefault()">
              <motion.div
                :layout-id="fromTrigger ? `${id}-surface` : undefined"
                :layout-dependency="lifted"
                :transition="{ layout: morphTransition }"
                :initial="fromTrigger ? false : { opacity: 0, scale: 0.97 }"
                :animate="appear"
                :style="morphSurfacePaint"
                :class="cn(commandSurfaceClass, props.class)"
                @animation-complete="onSurfaceDone"
              >
                <VisuallyHidden as-child>
                  <DialogTitle>{{ label }}</DialogTitle>
                </VisuallyHidden>
                <!-- Morphing, the content waits for the box to arrive and fades before it folds
                     back, as in DialogMorph. Appearing, it comes in with the palette. -->
                <motion.div
                  layout
                  :layout-dependency="lifted"
                  :initial="false"
                  :animate="{ opacity: open || !fromTrigger ? 1 : 0, transition: open ? { duration: 0 } : contentOut }"
                  class="flex min-h-0 flex-col"
                  @animation-complete="onContentDone"
                >
                  <ListboxRoot
                    ref="listbox"
                    highlight-on-hover
                    @highlight="highlighted = $event"
                    @leave="onLeave"
                    :class="
                      cn(
                        'flex min-h-0 flex-col stagger-children',
                        fromTrigger ? '[--stagger-delay:0.25s]' : '[--stagger-delay:0.05s]',
                      )
                    "
                  >
                    <slot :close="close" />
                  </ListboxRoot>
                </motion.div>
              </motion.div>
            </DialogContent>
          </div>
        </DialogPortal>
      </DialogRoot>
    </LayoutGroup>
  </MotionConfig>
</template>
