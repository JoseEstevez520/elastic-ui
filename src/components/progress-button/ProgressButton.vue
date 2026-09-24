<script setup lang="ts">
import { animate } from 'motion-v'
import { computed, onBeforeUnmount, ref, watch, type Component, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { prefersReducedMotion } from '../../utils/motion'
import { AlertIcon, CheckIcon } from '../../icons/internal'
import Button from '../button/Button.vue'
import type { ButtonVariants } from '../button/button.variants'
import IconSwap from '../icon-swap/IconSwap.vue'
import TextMorph from '../text-morph/TextMorph.vue'
import {
  amountVariants,
  progressFillVariants,
  progressOutcomeText,
  progressSweepClass,
} from './progress-button.variants'

export type ProgressButtonState = 'idle' | 'working' | 'done' | 'error'

/**
 * A button that becomes its own progress: pressed, it turns into "Exporting 40%" with the amount
 * filling it from behind, then into "Exported" with a check, and back to itself a moment later.
 * Its label morphs from phase to phase (TextMorph) and its icon turns into the next one; the
 * amount itself just updates. The work happens where it was asked for, with nothing appearing
 * elsewhere.
 *
 * Bind `v-model:state`; set it to `working` when the work starts and to `done` or `error` when
 * it ends. It goes back to `idle` by itself.
 */
const props = withDefaults(
  defineProps<{
    label: string
    /** Shown while working, followed by the amount when there is one. */
    workingLabel: string
    doneLabel: string
    errorLabel?: string
    icon?: Component
    /** 0 to 100 while working. Without it, a band sweeps across instead. */
    progress?: number
    variant?: ButtonVariants['variant']
    size?: ButtonVariants['size']
    class?: HTMLAttributes['class']
  }>(),
  { errorLabel: 'Something went wrong', variant: 'outline' },
)
const state = defineModel<ProgressButtonState>('state', { default: 'idle' })
const emit = defineEmits<{ click: [event: MouseEvent] }>()

// Pressable only at rest: a second press mid-work would start it again. It is not marked
// disabled, which would dim it just as it shows its progress.
function press(event: MouseEvent) {
  if (state.value === 'idle') emit('click', event)
}

// Long enough to read the result, short enough to act again soon after.
const RESULT_SHOWN = 2000
let back: ReturnType<typeof setTimeout> | undefined
watch(state, (now) => {
  clearTimeout(back)
  if (now === 'done' || now === 'error') back = setTimeout(() => (state.value = 'idle'), RESULT_SHOWN)
})
onBeforeUnmount(() => clearTimeout(back))

const working = computed(() => state.value === 'working')
const outcome = computed(() => (state.value === 'done' || state.value === 'error' ? state.value : undefined))
// Either outcome fills the button with its colour, so it reads as a result at a glance; an error
// left part way would look like a bar that got stuck.
const fillScale = computed(() => (outcome.value ? 1 : (amount.value ?? 0) / 100))
// On a solid button the label keeps its own colour: the outcome's would not read on the fill.
const outcomeText = computed(() => (outcome.value && props.variant !== 'solid' ? progressOutcomeText[outcome.value] : undefined))
const amount = computed(() => (props.progress === undefined ? undefined : Math.round(Math.min(100, Math.max(0, props.progress)))))
// The amount on show counts up to each new value alongside the fill, on the fill's own pace and
// curve (see `progressFillClass`), so the two climb together instead of the number jumping.
const GLIDE = { duration: 0.5, ease: 'easeOut' } as const
const shownAmount = ref(0)
let counting: { stop: () => void } | undefined
// Work that ends done shows 100 as it folds away, not wherever the count had got to.
watch(state, (now) => {
  if (now !== 'done') return
  counting?.stop()
  shownAmount.value = 100
})
watch(amount, (to) => {
  counting?.stop()
  if (to === undefined) return
  if (to < shownAmount.value || prefersReducedMotion()) {
    shownAmount.value = to
    return
  }
  counting = animate(shownAmount.value, to, { ...GLIDE, onUpdate: (v) => (shownAmount.value = Math.round(v)) })
})
onBeforeUnmount(() => counting?.stop())

// Only the phase morphs (Export → Exporting → Exported). The amount changes all the time, and a
// morph on every tick would be noise, so it counts up beside it, in digits of one width.
const phase = computed(() => {
  if (state.value === 'working') return amount.value === undefined ? `${props.workingLabel}…` : props.workingLabel
  if (state.value === 'done') return props.doneLabel
  if (state.value === 'error') return props.errorLabel
  return props.label
})
const shownIcon = computed(() => (state.value === 'done' ? CheckIcon : state.value === 'error' ? AlertIcon : props.icon))
</script>

<template>
  <Button
    :variant="variant"
    :size="size"
    :aria-busy="working || undefined"
    :class="cn('relative overflow-hidden', outcomeText, props.class)"
    @click="press"
  >
    <!-- The fill becomes the outcome, and fades only once the button is back at rest. Work that
         had no amount to show fills in at once as it ends. -->
    <Transition
      enter-from-class="opacity-0"
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      leave-to-class="opacity-0"
    >
      <span
        v-if="outcome || (working && amount !== undefined)"
        aria-hidden="true"
        :class="progressFillVariants({ outcome: outcome ?? 'none' })"
        :style="{ scale: `${fillScale} 1` }"
      />
    </Transition>
    <span v-if="working && amount === undefined" aria-hidden="true" :class="progressSweepClass" />
    <IconSwap v-if="shownIcon" :icon="shownIcon" class="relative" />
    <TextMorph class="relative" :text="phase" />
    <!-- Room for "100%" while working, so the button keeps its width as the amount climbs. It
         unfolds as the work starts and folds away as it ends, its room and the gap before it
         closing as it fades, so the button changes width in one movement with the label. Always
         there when there is an amount to show, so it can fold while showing where it ended. -->
    <span v-if="progress !== undefined" :aria-hidden="!working || undefined" :class="amountVariants({ shown: working })">
      {{ shownAmount }}%
    </span>
  </Button>
</template>
