<script setup lang="ts">
import { RadioGroupRoot } from 'reka-ui'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  toRef,
  useTemplateRef,
  watch,
  type HTMLAttributes,
} from 'vue'
import { cn } from '../../utils/cn'
import { useFieldGroup } from '../../utils/field'
import { bezier, EASE_EMPHASIZED, prefersReducedMotion } from '../../utils/motion'
import { provideLabRadio } from './radio.context'

/**
 * Lab: RadioGroup as the library's own. The circles are small trays, a tone set into the page with
 * no line (fields are trays), and the choice is ONE mark: choosing another, the dot travels from
 * the old tray to the new one, its leading edge a little ahead so it draws out a touch on the way,
 * and settles in (as the Carousel's pill). `cards`: each choice a row on the surface tone, the chosen
 * one standing on the raised tone, that raised surface sliding from row to row (as ToggleGroup's
 * pressed part), the dot travelling with it. Keyboard and ARIA from Reka UI.
 */
const props = withDefaults(
  defineProps<{
    variant?: 'dots' | 'cards'
    label?: string
    row?: boolean
    disabled?: boolean
    invalid?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { variant: 'dots' },
)
const value = defineModel<string>()
const fieldAttrs = useFieldGroup()
provideLabRadio({ variant: toRef(props, 'variant') })

interface Box {
  top: number
  left: number
  right: number
  bottom: number
}
const root = useTemplateRef<InstanceType<typeof RadioGroupRoot>>('root')
const el = () => root.value?.$el as HTMLElement | undefined
const dot = ref<Box>()
const card = ref<Box>()
// Which edges lead: those on the side it travels to take a little less time than the others, so
// the dot draws out a touch on the way and gathers again as it lands. In `cards` it rides with the
// raised surface instead, as one piece.
const quick = ref({ top: false, left: false, right: false, bottom: false })
const placed = ref(false)

function boxOf(target: Element, container: HTMLElement, inset = 0): Box {
  const r = target.getBoundingClientRect()
  const c = container.getBoundingClientRect()
  return {
    top: r.top - c.top + inset,
    left: r.left - c.left + inset,
    right: c.right - r.right + inset,
    bottom: c.bottom - r.bottom + inset,
  }
}

function measure() {
  const container = el()
  const tray = container?.querySelector('[data-state=checked] [data-radio-tray]')
  if (!container || !tray) return void ((dot.value = undefined), (card.value = undefined), (placed.value = false))
  // The dot: half the tray, centred in it.
  const next = boxOf(tray, container, 4)
  const before = dot.value
  if (before) {
    const down = next.top > before.top
    const across = next.left > before.left
    quick.value = { top: !down, bottom: down, left: !across, right: across }
  }
  dot.value = next
  const row = container.querySelector('[role=radio][data-state=checked]')
  card.value = row ? boxOf(row, container) : undefined
  if (!placed.value) requestAnimationFrame(() => (placed.value = true))
}
watch(value, () => nextTick(measure))
let resize: ResizeObserver | undefined
onMounted(() => {
  measure()
  const container = el()
  if (container) (resize = new ResizeObserver(() => measure())).observe(container)
})
onBeforeUnmount(() => resize?.disconnect())

const moves = computed(() => placed.value && !prefersReducedMotion())
const edge = (duration: number) => `${duration}s ${bezier(EASE_EMPHASIZED)}`
const px = (b: Box) => ({ top: `${b.top}px`, left: `${b.left}px`, right: `${b.right}px`, bottom: `${b.bottom}px` })
const SIDES = ['top', 'left', 'right', 'bottom'] as const
const dotStyle = computed(() => ({
  ...px(dot.value!),
  transition: !moves.value
    ? 'none'
    : SIDES.map((p) => `${p} ${edge(props.variant === 'cards' ? 0.45 : quick.value[p] ? 0.32 : 0.4)}`).join(','),
}))
const cardStyle = computed(() => ({
  ...px(card.value!),
  transition: moves.value ? SIDES.map((p) => `${p} ${edge(0.45)}`).join(',') : 'none',
}))
</script>

<template>
  <RadioGroupRoot
    ref="root"
    v-model="value"
    v-bind="fieldAttrs"
    :aria-label="label"
    :aria-invalid="invalid || undefined"
    :disabled="disabled"
    :orientation="row ? 'horizontal' : 'vertical'"
    :class="
      cn(
        'group/radios relative isolate flex',
        row ? 'flex-wrap gap-x-6 gap-y-2' : 'flex-col',
        !row && (variant === 'cards' ? 'gap-2' : 'gap-2.5'),
        props.class,
      )
    "
  >
    <!-- The raised surface under the chosen row, sliding to the next one. -->
    <span
      v-if="variant === 'cards' && card"
      aria-hidden="true"
      class="pointer-events-none absolute -z-10 rounded-[var(--radius-lg)] bg-surface-raised"
      :style="cardStyle"
    />
    <slot />
    <!-- The one mark: the choice itself, travelling from tray to tray. -->
    <span
      v-if="dot"
      aria-hidden="true"
      :class="[
        'pointer-events-none absolute z-10 rounded-full bg-[color:var(--checkbox-bg,var(--color-accent))]',
        invalid && 'bg-[color:var(--color-danger)]',
      ]"
      :style="dotStyle"
    />
  </RadioGroupRoot>
</template>
