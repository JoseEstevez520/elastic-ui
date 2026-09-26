<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { CheckIcon, XIcon } from '../../icons/internal'
import { contentOut, prefersReducedMotion } from '../../utils/motion'
import TrashIcon from './TrashIcon.vue'

/**
 * Lab: an action that asks before it acts, in its own place, with no dialog. At rest a small,
 * flat square with a bin. Pressed, it becomes the question: the square widens into a pill, the
 * bin's lid tips open, and the bin says it: a tray a tone deeper, its tail pointing back at the bin,
 * grows out of its side holding the answers, a confirm in the danger colour and a cancel. Depth
 * comes from tones, never shadows. Confirmed,
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

const SIZE = 40
// The square, or the square with the tray beside it: two answers and their gaps.
const width = computed(() => (state.value === 'asking' ? SIZE + 4 + 6 * 2 + 24 * 2 + 4 + 8 : SIZE))

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
  <!-- Depth from tones, not shadows: the pill, a tray a tone deeper set into it, and the answers
       as circles a tone lighter. -->
  <div
    ref="root"
    role="group"
    :aria-label="label"
    class="relative inline-flex h-10 items-center overflow-hidden rounded-[14px] bg-[color:light-dark(#ebebed,#262628)] align-middle transition-[width] duration-[350ms] ease-emphasized motion-reduce:transition-none"
    :style="{ width: `${width}px` }"
  >
    <button
      type="button"
      :aria-label="label"
      :aria-expanded="state === 'asking'"
      :disabled="state === 'working' || state === 'done'"
      class="flex size-10 shrink-0 cursor-pointer items-center justify-center text-fg-muted transition-colors hover:text-fg focus-ring-inset"
      @click="state === 'asking' ? cancel() : ask()"
    >
      <!-- The bin, the turning arc while it works, the check once done: one in the square's place. -->
      <span class="relative grid size-5 place-items-center">
        <TrashIcon
          :open="state === 'asking'"
          :class="[
            '[grid-area:1/1] size-5 transition-[opacity,scale,filter] duration-[250ms]',
            state === 'rest' || state === 'asking' || state === 'leaving'
              ? 'opacity-100'
              : 'scale-50 opacity-0 blur-[2px]',
          ]"
        />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.25"
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
            '[grid-area:1/1] size-5 text-[color:var(--color-danger)] transition-[opacity,scale,filter] duration-[250ms]',
            state === 'done' ? 'opacity-100' : 'scale-50 opacity-0 blur-[2px]',
          ]"
          :stroke-width="2.5"
        />
      </span>
    </button>
    <!-- The question, said by the bin: a tray with its tail pointing back at it, growing out of the
         bin's side and gone before the pill folds. -->
    <div
      :class="[
        'relative my-1 mr-1 flex h-8 items-center gap-1 rounded-[11px] bg-[color:light-dark(#dededf,#1b1b1d)] px-1',
        'origin-left transition-[opacity,transform] ease-emphasized motion-reduce:transition-none',
        state === 'asking' ? 'scale-x-100 opacity-100 delay-75 duration-300' : 'scale-x-50 opacity-0 duration-150',
      ]"
    >
      <span
        aria-hidden="true"
        class="absolute top-1/2 -left-[5px] size-2.5 -translate-y-1/2 rotate-45 rounded-[2px] bg-[color:light-dark(#dededf,#1b1b1d)]"
      />
      <button
        ref="confirmButton"
        type="button"
        :aria-label="confirmLabel"
        :tabindex="state === 'asking' ? 0 : -1"
        :class="[
          'relative flex size-6 cursor-pointer items-center justify-center rounded-full bg-[color:light-dark(#fff,#303033)] text-[color:var(--color-danger)] focus-ring',
          state === 'asking' ? 'animate-[blur-in_0.35s_var(--ease-soft)_0.15s_both]' : '',
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
          'relative flex size-6 cursor-pointer items-center justify-center rounded-full bg-[color:light-dark(#fff,#303033)] text-fg-muted transition-colors hover:text-fg focus-ring',
          state === 'asking' ? 'animate-[blur-in_0.35s_var(--ease-soft)_0.19s_both]' : '',
        ]"
        @click="cancel"
      >
        <XIcon aria-hidden="true" class="size-3.5" :stroke-width="2.5" />
      </button>
    </div>
  </div>
</template>
