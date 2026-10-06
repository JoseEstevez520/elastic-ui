<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import IconMorph from '../icon-morph/IconMorph.vue'
import type { IconMorphName } from '../icon-morph'
import TextMorph from '../text-morph/TextMorph.vue'
import { labelFor } from '../../utils/labels'

/**
 * An action that tells how it went, kept inside its own button, after Emil Kowalski's button
 * states: sending, saving, publishing, handing in. Pressed, the button gathers into a round one
 * around a turning arc, its word going out of focus; done, it widens again into what happened
 * ("Sent"), its icon turned into a check (IconMorph) and its word into the next (TextMorph); a
 * moment later it is itself again. If it
 * fails, it widens into that, tinted with the danger colour. Its width changes for real, on the
 * library's curve; nothing leaves the button, and the page around it never moves.
 *
 * For an action whose length is not known. With a known amount done, ProgressButton, which fills;
 * for something that cannot be undone, ConfirmButton, which asks first.
 */
const props = withDefaults(
  defineProps<{
    action?: () => Promise<void>
    /** Its icon at rest, one IconMorph can turn into the check. */
    icon?: IconMorphName
    label?: string
    doneLabel?: string
    errorLabel?: string
    disabled?: boolean
    /** `ghost` has no fill at rest, for a row of quiet actions or a page's header. */
    variant?: 'solid' | 'ghost'
    class?: HTMLAttributes['class']
  }>(),
  { variant: 'solid', icon: 'arrowRight', label: labelFor('send'), doneLabel: labelFor('sent'), errorLabel: labelFor('sendError') },
)

type State = 'rest' | 'working' | 'done' | 'failed'
const state = ref<State>('rest')
const word = computed(() =>
  state.value === 'done' ? props.doneLabel : state.value === 'failed' ? props.errorLabel : props.label,
)
const shownIcon = computed<IconMorphName>(() => (state.value === 'done' ? 'check' : props.icon))

// The width it has in each state: read from an unseen copy of what it will hold; round while working.
const HEIGHT = 40
const measure = useTemplateRef<HTMLElement>('measure')
const width = ref<number>()
async function fit() {
  await nextTick()
  width.value = state.value === 'working' ? HEIGHT : (measure.value?.offsetWidth ?? 0)
}
onMounted(fit)
watch(state, fit)

let timer: ReturnType<typeof setTimeout> | undefined
onBeforeUnmount(() => clearTimeout(timer))
async function run() {
  if (state.value !== 'rest' || props.disabled) return
  state.value = 'working'
  try {
    await (props.action?.() ?? new Promise<void>((resolve) => setTimeout(resolve, 1200)))
    state.value = 'done'
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
    :aria-busy="state === 'working'"
    :disabled="disabled"
    :aria-label="state === 'working' ? label : undefined"
    :class="[
      'relative inline-flex h-10 cursor-pointer items-center justify-center overflow-hidden rounded-full text-label focus-ring disabled:cursor-not-allowed disabled:opacity-50',
      'transition-[width,background-color,color] duration-[400ms] ease-emphasized motion-reduce:transition-none',
      state === 'failed'
        ? 'bg-[color:color-mix(in_oklab,var(--color-danger)_16%,var(--color-surface))] text-[color:var(--color-danger)]'
        : props.variant === 'ghost'
          ? 'bg-transparent text-[color:var(--color-fg-secondary)] hover:bg-[color:color-mix(in_oklab,var(--color-fg)_8%,transparent)] hover:text-[color:var(--color-fg)]'
          : 'bg-[color:var(--color-fg)] text-[color:var(--color-bg)]',
      props.class,
    ]"
    :style="{ width: width ? `${width}px` : undefined }"
    @click="run"
  >
    <!-- Its icon, or the check once done; the turning arc in its place while it works. -->
    <span class="relative grid size-4 shrink-0 place-items-center">
      <IconMorph
        :icon="shownIcon"
        :class="[
          '[grid-area:1/1] size-4 transition-[opacity,scale,filter] duration-[250ms]',
          state === 'working' ? 'scale-50 opacity-0 blur-[2px]' : 'opacity-100',
        ]"
      />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.25"
        stroke-linecap="round"
        aria-hidden="true"
        :class="[
          '[grid-area:1/1] size-4 transition-[opacity,scale,filter] duration-[250ms]',
          state === 'working' ? 'opacity-100 delay-150' : 'scale-50 opacity-0 blur-[2px]',
        ]"
      >
        <!-- Hidden, the arc stops where it is: a turn inside an svg is redrawn on every frame, even
             unseen. Stopped rather than removed, so it does not jump back as it fades out. -->
        <g
          :class="[
            'origin-[12px_12px] animate-[spin_1.3s_linear_infinite] [transform-box:view-box] motion-reduce:animate-none',
            state !== 'working' && '[animation-play-state:paused]',
          ]"
        >
          <path d="M12 3a9 9 0 1 0 9 9" />
        </g>
      </svg>
    </span>
    <!-- Its word: out of focus and folded while it works, morphing into the next once it is back. -->
    <span
      aria-live="polite"
      :class="[
        'overflow-hidden whitespace-nowrap transition-[max-width,margin,opacity,filter] duration-[400ms] ease-emphasized motion-reduce:transition-none',
        state === 'working' ? 'ml-0 max-w-0 opacity-0 blur-[2px]' : 'ml-2 max-w-96 opacity-100',
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
      <span class="size-4" /><span class="[font-kerning:none] [font-variant-ligatures:none]">{{ word }}</span>
    </span>
  </button>
</template>
