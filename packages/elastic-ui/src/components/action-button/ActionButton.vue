<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import IconMorph from '../icon-morph/IconMorph.vue'
import type { IconMorphName } from '../icon-morph'
import TextMorph from '../text-morph/TextMorph.vue'
import Tooltip from '../tooltip/Tooltip.vue'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import { Passthrough } from '../../utils/Passthrough'

// Its attributes go to the button, not to the tooltip round it.
defineOptions({ inheritAttrs: false })

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
 *
 * `size="icon"` keeps only its icon, in the square of the library's other icon buttons: its word
 * is its name for screen readers and its tooltip on hover and keyboard focus, following each
 * state ("Download", "Downloading", "Downloaded", "Not downloaded"), and what happened is
 * announced. The square turns round while it works, its icon into the check once done, and it
 * takes the danger tint if it fails. With `variant="ghost"`, for a row of quiet actions.
 */
const props = withDefaults(
  defineProps<{
    action?: () => Promise<void>
    /** Its icon at rest, one IconMorph can turn into the check. */
    icon?: IconMorphName
    label?: string
    doneLabel?: string
    errorLabel?: string
    /** Its name while it works, for screen readers (and the tooltip with `size="icon"`); `label` by default. */
    workingLabel?: string
    disabled?: boolean
    /** `ghost` has no fill at rest, for a row of quiet actions or a page's header. */
    variant?: 'solid' | 'ghost'
    /** `icon` shows the icon alone, its word kept as its name and its tooltip. */
    size?: 'md' | 'icon'
    class?: HTMLAttributes['class']
  }>(),
  { variant: 'solid', size: 'md', icon: 'arrowRight', label: labelFor('send'), doneLabel: labelFor('sent'), errorLabel: labelFor('sendError') },
)

type State = 'rest' | 'working' | 'done' | 'failed'
const state = ref<State>('rest')
const word = computed(() =>
  state.value === 'done' ? props.doneLabel : state.value === 'failed' ? props.errorLabel : props.label,
)
// Its name in each state: the word, or what it is doing while the word is folded away.
const name = computed(() => (state.value === 'working' ? (props.workingLabel ?? props.label) : word.value))
const iconOnly = computed(() => props.size === 'icon')
const shownIcon = computed<IconMorphName>(() => (state.value === 'done' ? 'check' : props.icon))

// The width it has in each state: read from an unseen copy of what it will hold; round while working.
const HEIGHT = 40
const measure = useTemplateRef<HTMLElement>('measure')
const width = ref<number>()
async function fit() {
  // An icon alone keeps its square in every state.
  if (iconOnly.value) return (width.value = undefined)
  await nextTick()
  width.value = state.value === 'working' ? HEIGHT : (measure.value?.offsetWidth ?? 0)
}
onMounted(fit)
watch([state, iconOnly], fit)

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
  <!-- An icon alone shows its word as a tooltip, on hover and keyboard focus, and keeps it open
       as it is pressed, so the word can be read as it changes. -->
  <component :is="iconOnly ? Tooltip : Passthrough" :content="name" persistent>
    <button
      v-bind="$attrs"
      type="button"
      :aria-busy="state === 'working'"
      :disabled="disabled"
      :aria-label="iconOnly || state === 'working' ? name : undefined"
      :class="
        cn(
          'relative inline-flex h-10 cursor-pointer items-center justify-center overflow-hidden text-label focus-ring disabled:cursor-not-allowed disabled:opacity-50',
          'transition-[width,background-color,color,border-radius] duration-[400ms] ease-emphasized motion-reduce:transition-none',
          // An icon alone is the square of the library's other icon buttons, round while it works.
          !iconOnly ? 'rounded-full' : state === 'working' ? 'size-10 rounded-[20px]' : 'size-10 rounded-[var(--button-radius,var(--radius-md))]',
          state === 'failed'
            ? 'bg-[color:color-mix(in_oklab,var(--color-danger)_16%,var(--color-surface))] text-[color:var(--color-danger)]'
            : props.variant === 'ghost'
              ? iconOnly
                ? 'bg-transparent text-fg-secondary hover:bg-bg-muted hover:text-fg'
                : 'bg-transparent text-[color:var(--color-fg-secondary)] hover:bg-[color:color-mix(in_oklab,var(--color-fg)_8%,transparent)] hover:text-[color:var(--color-fg)]'
              : 'bg-[color:var(--color-fg)] text-[color:var(--color-bg)]',
          props.class,
        )
      "
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
        v-if="!iconOnly"
        aria-live="polite"
        :class="[
          'overflow-hidden whitespace-nowrap transition-[max-width,margin,opacity,filter] duration-[400ms] ease-emphasized motion-reduce:transition-none',
          state === 'working' ? 'ml-0 max-w-0 opacity-0 blur-[2px]' : 'ml-2 max-w-96 opacity-100',
        ]"
      >
        <TextMorph :text="word" />
      </span>
      <!-- An icon alone tells what happened in words, as the word beside it would. -->
      <span v-else class="sr-only" aria-live="polite">{{ state === 'done' || state === 'failed' ? word : '' }}</span>
      <!-- Unseen: what it will hold, to read the width it will have. -->
      <span
        v-if="!iconOnly"
        ref="measure"
        aria-hidden="true"
        class="invisible absolute inline-flex items-center gap-2 pr-5 pl-4 whitespace-nowrap"
      >
        <span class="size-4" /><span class="[font-kerning:none] [font-variant-ligatures:none]">{{ word }}</span>
      </span>
    </button>
  </component>
</template>
