<script setup lang="ts">
import { useSpring } from 'motion-v'
import { computed, onBeforeUnmount, ref, watch, type Component, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import { prefersReducedMotion } from '../../utils/motion'
import { AlertIcon, CheckIcon } from '../../icons/internal'
import Button from '../button/Button.vue'
import type { ButtonVariants } from '../button/button.variants'
import IconSwap from '../icon-swap/IconSwap.vue'
import TextMorph from '../text-morph/TextMorph.vue'
import { amountVariants, progressFillVariants, progressOutcomeText } from './progress-button.variants'

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
    /** 0 to 100 while working. Without it, the label shimmers instead. */
    progress?: number
    variant?: ButtonVariants['variant']
    size?: ButtonVariants['size']
    class?: HTMLAttributes['class']
  }>(),
  { errorLabel: labelFor('somethingWentWrong'), variant: 'outline' },
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
const amount = computed(() =>
  props.progress === undefined ? undefined : Math.round(Math.min(100, Math.max(0, props.progress))),
)

// The fill and the amount follow the work on a spring, which keeps its speed from one update to
// the next, so steady steps run together into one movement (as Progress; a tween restarted on each
// update moves in jerks). Either outcome fills the button with its colour, so it reads as a result
// at a glance; an error left part way would look like a bar that got stuck. A new start begins
// from empty rather than drawing back.
const follow = useSpring(0, { stiffness: 22, damping: 12 })
const shown = ref(0)
const unfollow = follow.on('change', (v) => (shown.value = v))
onBeforeUnmount(unfollow)
watch(
  [amount, outcome],
  ([to, end]) => {
    const target = end ? 1 : (to ?? 0) / 100
    if (target < shown.value || prefersReducedMotion()) follow.jump(target)
    else follow.set(target)
  },
  { immediate: true },
)
const fillScale = computed(() => shown.value)
const shownAmount = computed(() => (state.value === 'done' ? 100 : Math.round(shown.value * 100)))
// On a solid button the label keeps its own colour: the outcome's would not read on the fill.
const outcomeText = computed(() =>
  outcome.value && props.variant !== 'solid' ? progressOutcomeText[outcome.value] : undefined,
)

// Only the phase morphs (Export → Exporting → Exported). The amount changes all the time, and a
// morph on every tick would be noise, so it counts up beside it, in digits of one width.
const phase = computed(() => {
  if (state.value === 'working') return amount.value === undefined ? `${props.workingLabel}…` : props.workingLabel
  if (state.value === 'done') return props.doneLabel
  if (state.value === 'error') return props.errorLabel
  return props.label
})
const shownIcon = computed(() =>
  state.value === 'done' ? CheckIcon : state.value === 'error' ? AlertIcon : props.icon,
)
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
      <!-- The outer layer only fades; the fill inside keeps its own tint, so the two never compete
           over the same opacity. -->
      <span
        v-if="outcome || (working && amount !== undefined)"
        aria-hidden="true"
        class="pointer-events-none absolute inset-0"
      >
        <span :class="progressFillVariants({ outcome: outcome ?? 'none' })" :style="{ scale: `${fillScale} 1` }" />
      </span>
    </Transition>
    <!-- With no amount to show, the label shimmers while it works, as everything in the library
         says it is working. -->
    <span :class="cn('relative inline-flex items-center gap-2', working && amount === undefined && 'shimmer')">
      <IconSwap v-if="shownIcon" :icon="shownIcon" />
      <TextMorph :text="phase" />
    </span>
    <!-- Room for "100%" while working, so the button keeps its width as the amount climbs. It
         unfolds as the work starts and folds away as it ends, its room and the gap before it
         closing as it fades, so the button changes width in one movement with the label. Always
         there when there is an amount to show, so it can fold while showing where it ended. -->
    <span
      v-if="progress !== undefined"
      :aria-hidden="!working || undefined"
      :class="amountVariants({ shown: working })"
    >
      {{ shownAmount }}%
    </span>
  </Button>
</template>
