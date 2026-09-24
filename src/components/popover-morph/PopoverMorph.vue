<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { cn } from '../../utils/cn'
import {
  popoverMorphLabelState,
  popoverMorphPanelVariants,
  popoverMorphSurfaceVariants,
  popoverMorphTriggerClass,
} from './popover-morph.variants'

/**
 * A trigger that becomes its own panel: the button's box grows into the panel and folds back
 * into it, while the label blurs out and the content comes into focus. Text never scales; the
 * box takes its size and clips the content, which sits at its full size from the start.
 */
const props = withDefaults(
  defineProps<{
    /** The edge the panel lines up with, and the corner it grows from. */
    align?: 'start' | 'end'
    side?: 'bottom' | 'top'
    /** Accessible name of the panel. */
    label?: string
    /** Applied to the panel. */
    class?: HTMLAttributes['class']
  }>(),
  { align: 'start', side: 'bottom' },
)

const open = defineModel<boolean>('open', { default: false })
const close = () => (open.value = false)

const root = useTemplateRef<HTMLElement>('root')
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const panel = useTemplateRef<HTMLElement>('panel')
const panelId = useId()

// The surface animates between two measured boxes; `auto` cannot be transitioned. Until the first
// measurement (and in server rendering) it simply covers the trigger.
const triggerSize = ref<{ width: number; height: number }>()
const panelSize = ref<{ width: number; height: number }>()
let observer: ResizeObserver | undefined

onMounted(() => {
  const measure = () => {
    if (trigger.value) triggerSize.value = { width: trigger.value.offsetWidth, height: trigger.value.offsetHeight }
    if (panel.value) panelSize.value = { width: panel.value.offsetWidth, height: panel.value.offsetHeight }
  }
  measure()
  observer = new ResizeObserver(measure)
  for (const el of [trigger.value, panel.value]) if (el) observer.observe(el)
})
onBeforeUnmount(() => observer?.disconnect())

const surfaceStyle = computed(() => {
  const size = open.value ? panelSize.value : triggerSize.value
  return size ? { width: `${size.width}px`, height: `${size.height}px` } : { inset: 0 }
})

useEventListener<KeyboardEvent>(() => document, 'keydown', (event) => {
  if (open.value && event.key === 'Escape') close()
})
useEventListener<PointerEvent>(() => document, 'pointerdown', (event) => {
  if (open.value && event.target instanceof Node && !root.value?.contains(event.target)) close()
})

// Focus moves into the panel as it opens, and back to the trigger if it was inside on close. A
// close by clicking elsewhere leaves focus where that click put it.
watch(open, async (isOpen) => {
  const hadFocus = panel.value?.contains(document.activeElement)
  await nextTick()
  if (isOpen) {
    const first = panel.value?.querySelector<HTMLElement>('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ;(first ?? panel.value)?.focus({ preventScroll: true })
  } else if (hadFocus) {
    trigger.value?.focus({ preventScroll: true })
  }
})
</script>

<template>
  <div ref="root" :class="cn('relative inline-block align-top', open && 'z-50')">
    <div :class="popoverMorphSurfaceVariants({ align, side, open })" :style="surfaceStyle">
      <div
        :id="panelId"
        ref="panel"
        role="dialog"
        :aria-label="label"
        tabindex="-1"
        :inert="!open"
        :class="cn(popoverMorphPanelVariants({ align, side, open }), props.class)"
      >
        <slot :close="close" />
      </div>
    </div>

    <!-- Above the surface; while open it blurs out and lets clicks through to the panel. -->
    <button
      ref="trigger"
      type="button"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :aria-controls="panelId"
      :inert="open"
      :class="cn(popoverMorphTriggerClass, open ? popoverMorphLabelState.open : popoverMorphLabelState.closed)"
      @click="open = !open"
    >
      <slot name="trigger" />
    </button>
  </div>
</template>
