<script setup lang="ts">
import { ToggleGroupRoot } from 'reka-ui'
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
import { prefersReducedMotion } from '../../utils/motion'
import { provideToggleGroup } from './toggle.context'
import { toggleGroupClass, toggleIndicatorClass, type ToggleSize } from './toggle.variants'

/**
 * Toggles that belong together in a toolbar: text formatting (`multiple`, each pressed on its
 * own), or a choice of view (`single`, one at a time). The group is a tray a tone off the page and
 * a pressed item a raised part set on it, split rather than boxed; in `single`, that raised part
 * slides from one item to the next. For switching between views of content, Tabs; for narrowing a
 * list, Filters. Arrow keys move between items (Reka UI's roving focus); name the group with
 * `aria-label`.
 */
const props = withDefaults(
  defineProps<{
    type?: 'single' | 'multiple'
    size?: ToggleSize
    disabled?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { type: 'single', size: 'md' },
)
const value = defineModel<string | string[]>()
provideToggleGroup({ type: toRef(props, 'type'), size: toRef(props, 'size') })

// The indicator: where the pressed item is, read from the layout; hidden while none is pressed.
const root = useTemplateRef<InstanceType<typeof ToggleGroupRoot>>('root')
const box = ref<{ left: number; width: number }>()
const placed = ref(false)
function place() {
  if (props.type !== 'single') return
  const el = root.value?.$el as HTMLElement | undefined
  const on = el?.querySelector<HTMLElement>('[data-state="on"]')
  box.value = on ? { left: on.offsetLeft, width: on.offsetWidth } : undefined
}
watch(value, async () => {
  await nextTick()
  place()
  // The first place is taken at once; from then on it slides.
  requestAnimationFrame(() => (placed.value = true))
})
let observer: ResizeObserver | undefined
onMounted(() => {
  place()
  requestAnimationFrame(() => (placed.value = true))
  const el = root.value?.$el as HTMLElement | undefined
  if (el) (observer = new ResizeObserver(place)).observe(el)
})
onBeforeUnmount(() => observer?.disconnect())

const indicatorStyle = computed(() => ({
  width: `${box.value?.width ?? 0}px`,
  transform: `translateX(${box.value?.left ?? 0}px)`,
  opacity: box.value ? 1 : 0,
  transition:
    placed.value && !prefersReducedMotion()
      ? 'transform 0.45s var(--ease-emphasized), width 0.45s var(--ease-emphasized), opacity 0.15s linear'
      : 'none',
}))
</script>

<template>
  <ToggleGroupRoot
    ref="root"
    v-model="value as never"
    :type="type"
    :disabled="disabled"
    :class="cn(toggleGroupClass, props.class)"
  >
    <span v-if="type === 'single'" aria-hidden="true" :class="toggleIndicatorClass" :style="indicatorStyle" />
    <slot />
  </ToggleGroupRoot>
</template>
