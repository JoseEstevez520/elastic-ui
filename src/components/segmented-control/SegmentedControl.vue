<script setup lang="ts">
import { RadioGroupRoot } from 'reka-ui'
import { nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { segmentedControlClass, segmentedControlIndicatorClass } from './segmented-control.variants'

/**
 * One choice among a few, side by side, such as a filter over a list: the selected option's
 * surface slides to the next one, taking its width. It filters or switches what is already on
 * the page, so unlike Tabs it has no panels to point at: it is a radio group, reached with the
 * arrow keys. Put SegmentedControlItems inside.
 */
const props = defineProps<{
  /** Accessible name of the group. */
  label?: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()

const value = defineModel<string>()

// The surface sits over the selected option's measured box. It takes its first place at once and
// slides from then on, and follows at once when the options change width (a web font loading).
const root = useTemplateRef<InstanceType<typeof RadioGroupRoot>>('root')
const box = ref<{ left: number; width: number }>()
const sliding = ref(false)
function place() {
  const el = root.value?.$el as HTMLElement | undefined
  const selected = el?.querySelector<HTMLElement>('[role="radio"][data-state="checked"]')
  box.value = selected ? { left: selected.offsetLeft, width: selected.offsetWidth } : undefined
}
watch(value, () => nextTick(place))

let observer: ResizeObserver | undefined
let frame = 0
onMounted(() => {
  place()
  frame = requestAnimationFrame(() => (sliding.value = true))
  const el = root.value?.$el as HTMLElement | undefined
  observer = new ResizeObserver(place)
  if (el) observer.observe(el)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(frame)
})
</script>

<template>
  <RadioGroupRoot
    ref="root"
    v-model="value"
    :aria-label="label"
    :disabled="disabled"
    orientation="horizontal"
    loop
    :class="cn(segmentedControlClass, props.class)"
  >
    <span
      aria-hidden="true"
      :class="[
        segmentedControlIndicatorClass,
        sliding && 'transition-[translate,width,opacity] duration-[450ms] ease-emphasized motion-reduce:transition-none',
      ]"
      :style="box ? { translate: `${box.left}px 0`, width: `${box.width}px` } : { opacity: 0 }"
    />
    <slot />
  </RadioGroupRoot>
</template>
