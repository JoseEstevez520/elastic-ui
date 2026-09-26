<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { CheckIcon, XIcon } from '../../icons/internal'
import { contentOut, prefersReducedMotion } from '../../utils/motion'
import TrashIcon from './TrashIcon.vue'

/**
 * Lab: an action that asks before it acts, in its own place, with no dialog. At rest a small,
 * flat square with a bin. Pressed, it becomes the question: the square widens into a pill, lifting
 * into the library's material (a soft shadow and a line of light along its top), the bin's lid
 * tips open, and a confirm, in the danger colour, and a cancel come into focus beside it. Confirmed,
 * its content fades, it folds back to its square while the work runs (a turning arc), and the arc
 * turns into a check before it is a bin again. Escape, the cancel or a click elsewhere take it back.
 */
const props = withDefaults(
  defineProps<{
    /** What it does, once confirmed; the square waits for it. */
    action?: () => Promise<void>
    label?: string
    confirmLabel?: string
    cancelLabel?: string
  }>(),
  { label: 'Delete', confirmLabel: 'Yes, delete', cancelLabel: 'Cancel' },
)

type State = 'rest' | 'asking' | 'leaving' | 'working' | 'done'
const state = ref<State>('rest')
const root = useTemplateRef<HTMLElement>('root')
const confirmButton = useTemplateRef<HTMLButtonElement>('confirmButton')

const SIZE = 36
const width = computed(() => (state.value === 'asking' ? SIZE * 3 : SIZE))
const lifted = computed(() => state.value === 'asking')

let timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, run: () => void) => timers.push(setTimeout(run, prefersReducedMotion() ? 0 : ms))
onBeforeUnmount(() => timers.forEach(clearTimeout))

async function ask() {
  if (state.value !== 'rest') return
  state.value = 'asking'
  await nextTick()
  confirmButton.value?.focus({ preventScroll: true })
}
function cancel() {
  if (state.value !== 'asking') return
  // The question fades first, then the pill folds back into its square.
  state.value = 'leaving'
  later(contentOut.duration * 1000, () => (state.value = 'rest'))
}
function confirm() {
  if (state.value !== 'asking') return
  state.value = 'leaving'
  later(contentOut.duration * 1000, async () => {
    state.value = 'working'
    try {
      await (props.action?.() ?? new Promise<void>((resolve) => setTimeout(resolve, 900)))
    } finally {
      state.value = 'done'
      later(1100, () => (state.value = 'rest'))
    }
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
    :class="[
      'relative inline-flex h-9 items-center overflow-hidden rounded-[12px] align-middle',
      'transition-[width,background-color,box-shadow] duration-[350ms] ease-emphasized motion-reduce:transition-none',
      lifted
        ? 'bg-[color:var(--color-bg)] shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_0_0_1px_var(--color-border),0_6px_16px_-6px_rgb(0_0_0/0.25)]'
        : 'bg-bg-muted shadow-[inset_0_1px_0_transparent,0_0_0_1px_transparent,0_0_0_0_transparent]',
    ]"
    :style="{ width: `${width}px` }"
  >
    <!-- The bin, which stays where it is as the pill opens beside it. -->
    <button
      type="button"
      :aria-label="label"
      :aria-expanded="state === 'asking'"
      :disabled="state === 'working' || state === 'done'"
      class="flex size-9 shrink-0 cursor-pointer items-center justify-center text-fg-secondary transition-colors hover:text-fg focus-ring-inset"
      @click="state === 'asking' ? cancel() : ask()"
    >
      <!-- The bin, the turning arc while it works, the check once done: one in the square's place. -->
      <span class="relative grid size-4 place-items-center">
        <TrashIcon
          :open="state === 'asking'"
          :class="[
            '[grid-area:1/1] size-4 transition-[opacity,scale,filter] duration-[250ms]',
            state === 'rest' || state === 'asking' || state === 'leaving'
              ? 'opacity-100'
              : 'scale-50 opacity-0 blur-[2px]',
          ]"
        />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          :class="[
            '[grid-area:1/1] size-4 animate-spin transition-[opacity,scale,filter] duration-[250ms]',
            state === 'working' ? 'opacity-100' : 'scale-50 opacity-0 blur-[2px]',
          ]"
          aria-hidden="true"
        >
          <path d="M12 3a9 9 0 1 0 9 9" />
        </svg>
        <CheckIcon
          aria-hidden="true"
          :class="[
            '[grid-area:1/1] size-4 text-[color:var(--color-danger)] transition-[opacity,scale,filter] duration-[250ms]',
            state === 'done' ? 'opacity-100' : 'scale-50 opacity-0 blur-[2px]',
          ]"
        />
      </span>
    </button>
    <!-- The question: its two answers, in focus once the pill has room, gone before it folds. -->
    <button
      ref="confirmButton"
      type="button"
      :aria-label="confirmLabel"
      :tabindex="state === 'asking' ? 0 : -1"
      :class="[
        'flex size-9 shrink-0 cursor-pointer items-center justify-center focus-ring-inset',
        state === 'asking'
          ? 'animate-[blur-in_0.35s_var(--ease-soft)_0.12s_both]'
          : 'opacity-0 transition-opacity duration-150',
      ]"
      @click="confirm"
    >
      <span
        class="flex size-6 items-center justify-center rounded-full bg-[color:var(--color-danger)] text-[color:var(--color-bg)]"
      >
        <CheckIcon aria-hidden="true" class="size-3.5" :stroke-width="3" />
      </span>
    </button>
    <button
      type="button"
      :aria-label="cancelLabel"
      :tabindex="state === 'asking' ? 0 : -1"
      :class="[
        'flex size-9 shrink-0 cursor-pointer items-center justify-center text-fg-muted transition-colors hover:text-fg focus-ring-inset',
        state === 'asking'
          ? 'animate-[blur-in_0.35s_var(--ease-soft)_0.16s_both]'
          : 'opacity-0 transition-opacity duration-150',
      ]"
      @click="cancel"
    >
      <XIcon aria-hidden="true" class="size-4" />
    </button>
  </div>
</template>
