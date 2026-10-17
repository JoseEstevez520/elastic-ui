<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef, type Component, type HTMLAttributes } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { AlertIcon, CheckIcon, XIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import { contentOut, prefersReducedMotion } from '../../utils/motion'
import BinIcon from './BinIcon.vue'
import {
  confirmAnswerClass,
  confirmGlyphClass,
  confirmGlyphHidden,
  confirmHalfClass,
  confirmPillClass,
  confirmPillTone,
  confirmToneText,
  confirmTailClass,
} from './confirm-button.variants'

/**
 * An action that asks before it acts, in its own place, with no dialog: a delete, a sign-out, a
 * reset. At rest a small, flat square with its icon. Pressed, it becomes the question: the square
 * widens into a pill, the bin's lid tips open, and the pill splits in two, the answers' half a tone
 * deeper with its tail pointing back at the icon, holding a confirm in the danger colour and a
 * cancel. Confirmed, the question fades, the pill folds back to its square and takes a tint of the
 * danger colour while the action runs (a turning arc), which turns into a check, or into what went
 * wrong, before it is itself again. Escape, the cancel or a click elsewhere take it back.
 *
 * Inspired by Rare UI's delete button, redone in the library's own way.
 */
const props = withDefaults(
  defineProps<{
    /** What it does once confirmed; the square waits for it, and shows if it fails. */
    action?: () => Promise<void> | void
    /** Its icon; the bin with its lid by default. It is told `open` while it asks, to move its parts. */
    icon?: Component
    /**
     * `danger` for what cannot be undone (a delete): the confirm, and the square while it acts, in
     * the danger colour. `warning` for what puts something away but can be undone (an archive), in
     * the warning colour. `neutral` for what asks but means nothing coloured (a sign-out).
     */
    tone?: 'danger' | 'warning' | 'neutral'
    /**
     * Its look at rest: `surface`, a flat square in the muted tone (the default), or `ghost`, as a
     * ghost Button, for a row of quiet actions. Either way it takes the surface as it asks.
     */
    variant?: 'surface' | 'ghost'
    /** Its accessible name, and the question's. */
    label?: string
    confirmLabel?: string
    cancelLabel?: string
    disabled?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { label: labelFor('delete'), confirmLabel: labelFor('confirm'), cancelLabel: labelFor('cancel'), tone: 'danger', variant: 'surface' },
)
const emit = defineEmits<{ confirm: []; error: [error: unknown] }>()

type State = 'rest' | 'asking' | 'leaving' | 'working' | 'done' | 'failed'
const state = ref<State>('rest')
const root = useTemplateRef<HTMLElement>('root')
const confirmButton = useTemplateRef<HTMLButtonElement>('confirmButton')
const trigger = useTemplateRef<HTMLButtonElement>('trigger')

const SIZE = 40
// The square, or the square with the answers' half beside it: a gap, two answers and their room.
const width = computed(() => (state.value === 'asking' ? SIZE + 8 + 16 + 24 * 2 + 6 : SIZE))
const tinted = computed(() => state.value === 'working' || state.value === 'done' || state.value === 'failed')
// Colour only where it means something: a neutral action keeps the text's colour throughout.
const toneText = computed(() => confirmToneText[props.tone])
const showsIcon = computed(() => state.value === 'rest' || state.value === 'asking' || state.value === 'leaving')

let timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, run: () => void) => timers.push(setTimeout(run, prefersReducedMotion() ? 0 : ms))
onBeforeUnmount(() => timers.forEach(clearTimeout))

async function ask() {
  if (state.value !== 'rest' || props.disabled) return
  state.value = 'asking'
  await nextTick()
  confirmButton.value?.focus({ preventScroll: true })
}
function cancel() {
  if (state.value !== 'asking') return
  // The question fades first, then the pill folds back into its square.
  const hadFocus = root.value?.contains(document.activeElement)
  state.value = 'leaving'
  later(contentOut.duration * 1000, () => {
    state.value = 'rest'
    if (hadFocus) trigger.value?.focus({ preventScroll: true })
  })
}
function confirm() {
  if (state.value !== 'asking') return
  trigger.value?.focus({ preventScroll: true })
  state.value = 'leaving'
  later(contentOut.duration * 1000, async () => {
    state.value = 'working'
    emit('confirm')
    try {
      await props.action?.()
      state.value = 'done'
    } catch (error) {
      state.value = 'failed'
      emit('error', error)
    }
    later(1100, () => (state.value = 'rest'))
  })
}
useEventListener<KeyboardEvent>(
  () => document,
  'keydown',
  (e) => e.key === 'Escape' && cancel(),
)
useEventListener<PointerEvent>(
  () => document,
  'pointerdown',
  (e) => {
    if (state.value === 'asking' && e.target instanceof Node && !root.value?.contains(e.target)) cancel()
  },
)
</script>

<template>
  <div
    ref="root"
    role="group"
    :aria-label="label"
    :class="
      cn(
        confirmPillClass,
        tinted && tone !== 'neutral'
          ? confirmPillTone[tone]
          : variant === 'ghost' && state === 'rest'
            ? confirmPillTone.ghost
            : confirmPillTone.rest,
        disabled && 'opacity-50',
        props.class,
      )
    "
    :style="{ width: `${width}px` }"
  >
    <button
      ref="trigger"
      type="button"
      :aria-label="label"
      :aria-expanded="state === 'asking' ? 'true' : 'false'"
      :aria-disabled="disabled || tinted || undefined"
      :class="[
        'flex size-10 shrink-0 items-center justify-center transition-colors outline-none',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        tinted ? toneText : variant === 'ghost' ? 'text-fg-secondary hover:text-fg' : 'text-fg-muted hover:text-fg',
      ]"
      @click="state === 'asking' ? cancel() : ask()"
    >
      <span class="relative grid size-5 place-items-center" aria-live="polite">
        <component
          :is="icon"
          v-if="icon"
          :open="state === 'asking'"
          aria-hidden="true"
          :class="[confirmGlyphClass, 'size-[18px]', !showsIcon && confirmGlyphHidden]"
        />
        <BinIcon
          v-else
          :open="state === 'asking'"
          :class="[confirmGlyphClass, 'size-5', !showsIcon && confirmGlyphHidden]"
        />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
          :class="[confirmGlyphClass, 'size-4', state !== 'working' && confirmGlyphHidden]"
        >
          <!-- The turn is the arc's own, apart from the fade and scale of the svg around it, and calm:
               at the usual 1s, this small, it reads as a tremble. Hidden, it stops where it is: a
               turn inside an svg is redrawn on every frame, even unseen. -->
          <g
            :class="[
              'origin-[12px_12px] animate-[spin_1.3s_linear_infinite] [transform-box:view-box] motion-reduce:animate-none',
              state !== 'working' && '[animation-play-state:paused]',
            ]"
          >
            <path d="M12 3a9 9 0 1 0 9 9" />
          </g>
        </svg>
        <CheckIcon
          aria-hidden="true"
          :stroke-width="2.5"
          :class="[confirmGlyphClass, 'size-5', state !== 'done' && confirmGlyphHidden]"
        />
        <AlertIcon
          aria-hidden="true"
          :class="[confirmGlyphClass, 'size-[18px]', state !== 'failed' && confirmGlyphHidden]"
        />
      </span>
    </button>
    <!-- The question: the pill split in two, the answers' half growing out of the icon's side and
         gone before the pill folds. -->
    <div
      :class="[
        confirmHalfClass,
        state === 'asking' ? 'scale-x-100 opacity-100 delay-75 duration-300' : 'scale-x-50 opacity-0 duration-150',
      ]"
    >
      <span aria-hidden="true" :class="confirmTailClass" />
      <button
        ref="confirmButton"
        type="button"
        :aria-label="confirmLabel"
        :tabindex="state === 'asking' ? 0 : -1"
        :class="[
          confirmAnswerClass,
          toneText,
          state === 'asking' && 'animate-[blur-in_0.35s_var(--ease-soft)_0.15s_both] motion-reduce:animate-none',
        ]"
        @click="confirm"
      >
        <CheckIcon aria-hidden="true" class="size-3.5" :stroke-width="3" />
      </button>
      <button
        type="button"
        :aria-label="cancelLabel"
        :tabindex="state === 'asking' ? 0 : -1"
        :class="[
          confirmAnswerClass,
          'text-fg-muted transition-colors hover:text-fg',
          state === 'asking' && 'animate-[blur-in_0.35s_var(--ease-soft)_0.19s_both] motion-reduce:animate-none',
        ]"
        @click="cancel"
      >
        <XIcon aria-hidden="true" class="size-3.5" :stroke-width="2.5" />
      </button>
    </div>
  </div>
</template>
