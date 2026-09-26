<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import IconMorph from '../../components/icon-morph/IconMorph.vue'
import TextMorph from '../../components/text-morph/TextMorph.vue'

/**
 * Lab: sending, told by the button itself and kept inside it, as Emil Kowalski's button states,
 * its icon an object whose parts move, as ConfirmButton's bin. Its icon is a paper plane. Pressed,
 * the plane lifts its nose and tips up, ready to go but never leaving, as the bin's lid tips open;
 * the button gathers into a round one around it, a fine ring turning along its edge, the word going
 * out of focus. Sent, the plane folds, stroke by stroke, into a check (IconMorph) and the button
 * widens into "Sent"; a moment later it is itself again. If it fails, it widens into "Not sent", tinted with the danger colour. Its
 * width changes for real, on the library's curve; nothing leaves the button, and the page around
 * it never moves.
 */
const props = withDefaults(
  defineProps<{
    action?: () => Promise<void>
    label?: string
    sentLabel?: string
    failedLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  { label: 'Send', sentLabel: 'Sent', failedLabel: 'Not sent' },
)

type State = 'rest' | 'sending' | 'sent' | 'failed'
const state = ref<State>('rest')
const word = computed(() =>
  state.value === 'sent' ? props.sentLabel : state.value === 'failed' ? props.failedLabel : props.label,
)
const icon = computed(() => (state.value === 'sent' ? 'check' : 'plane'))

// The width it has in each state: read from an unseen copy of what it will hold; round while sending.
const HEIGHT = 40
const measure = useTemplateRef<HTMLElement>('measure')
const width = ref<number>()
async function fit() {
  await nextTick()
  width.value = state.value === 'sending' ? HEIGHT : (measure.value?.offsetWidth ?? 0)
}
onMounted(fit)
watch(state, fit)

let timer: ReturnType<typeof setTimeout> | undefined
onBeforeUnmount(() => clearTimeout(timer))
async function send() {
  if (state.value !== 'rest') return
  state.value = 'sending'
  try {
    await (props.action?.() ?? new Promise<void>((resolve) => setTimeout(resolve, 1200)))
    state.value = 'sent'
  } catch {
    state.value = 'failed'
  }
  clearTimeout(timer)
  timer = setTimeout(() => (state.value = 'rest'), 1800)
}
</script>

<template>
  <button
    type="button"
    :aria-busy="state === 'sending'"
    :aria-label="state === 'sending' ? label : undefined"
    :class="[
      'relative inline-flex h-10 cursor-pointer items-center justify-center overflow-hidden rounded-full text-sm font-medium focus-ring',
      'transition-[width,background-color,color] duration-[400ms] ease-emphasized motion-reduce:transition-none',
      state === 'failed'
        ? 'bg-[color:color-mix(in_oklab,var(--color-danger)_16%,var(--color-surface))] text-[color:var(--color-danger)]'
        : 'bg-[color:var(--color-fg)] text-[color:var(--color-bg)]',
      props.class,
    ]"
    :style="{ width: width ? `${width}px` : undefined }"
    @click="send"
  >
    <!-- The ring turning along the round button's edge while it sends. -->
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      :class="[
        'pointer-events-none absolute top-0 left-1/2 size-10 -translate-x-1/2 transition-opacity duration-300',
        state === 'sending' ? 'opacity-100 delay-200' : 'opacity-0',
      ]"
    >
      <g class="origin-center animate-[spin_1.3s_linear_infinite] [transform-box:view-box] motion-reduce:animate-none">
        <circle cx="20" cy="20" r="17" stroke="currentColor" stroke-opacity="0.25" stroke-width="1.5" />
        <path d="M20 3a17 17 0 0 1 17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </g>
    </svg>
    <!-- The plane: its nose lifting while it sends, folding into the check once sent. -->
    <span
      :class="[
        'relative size-4 shrink-0 transition-[translate,rotate] duration-[350ms] ease-emphasized motion-reduce:transition-none',
        state === 'sending' ? '-translate-y-px translate-x-px -rotate-[18deg]' : '',
      ]"
    >
      <IconMorph :icon="icon" class="size-4" />
    </span>
    <!-- Its word: out of focus and folded while it sends, morphing into the next once it is back. -->
    <span
      aria-live="polite"
      :class="[
        'overflow-hidden whitespace-nowrap transition-[max-width,margin,opacity,filter] duration-[400ms] ease-emphasized motion-reduce:transition-none',
        state === 'sending' ? 'ml-0 max-w-0 opacity-0 blur-[2px]' : 'ml-2 max-w-40 opacity-100',
      ]"
    >
      <TextMorph :text="word" />
    </span>
    <!-- Unseen: what it will hold, to read the width it will have. -->
    <span
      ref="measure"
      aria-hidden="true"
      class="invisible absolute inline-flex items-center gap-2 pr-5 pl-4 whitespace-nowrap"
    >
      <span class="size-4" />{{ word }}
    </span>
  </button>
</template>
