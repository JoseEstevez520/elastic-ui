<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { useFieldRoom } from '../../composables/useFieldRoom'
import { cn } from '../../utils/cn'

/**
 * Internal: a field that grows into its panel. The field's own outline is a surface that, opening,
 * stretches down from the field to hold the panel under it (a month, a list of options) and folds
 * back into the field on closing, as PopoverMorph's button becomes its panel. The field stays where
 * it is, on top; the panel comes into focus once the surface is on its way. Escape and a click
 * outside close it.
 */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
const open = defineModel<boolean>('open', { default: false })

const root = useTemplateRef<HTMLElement>('root')
const row = useTemplateRef<HTMLElement>('row')
const panel = useTemplateRef<HTMLElement>('panel')
const size = ref({ row: 40, panel: 0 })
let observer: ResizeObserver | undefined
onMounted(() => {
  const measure = () => (size.value = { row: row.value?.offsetHeight ?? 40, panel: panel.value?.offsetHeight ?? 0 })
  measure()
  observer = new ResizeObserver(measure)
  for (const el of [row.value, panel.value]) if (el) observer.observe(el)
})
onBeforeUnmount(() => observer?.disconnect())

// Above what follows it while open, and until it has folded back.
const FOLD = 300
const folding = ref(false)
let foldTimer: ReturnType<typeof setTimeout> | undefined
watch(open, (isOpen) => {
  clearTimeout(foldTimer)
  folding.value = !isOpen
  if (!isOpen) foldTimer = setTimeout(() => (folding.value = false), FOLD)
})
onBeforeUnmount(() => clearTimeout(foldTimer))

// In a box that clips its content (a dialog, a sheet, a popover), the outline is drawn over what
// follows, out of the flow, so the box would cut the panel off: it is told how far the field reaches
// open, makes room for it and scrolls it into view, and the panel is capped to what the box can
// show. The room is given back once the field has folded, so the box closes after it.
const room = useFieldRoom()
const panelMax = computed(() => (room.space.value === undefined ? undefined : room.space.value - size.value.row - 1))
let revealed = false
watch([open, folding, size], async ([isOpen, isFolding]) => {
  if (!isOpen) {
    revealed = false
    if (!isFolding) room.claim(undefined)
    return
  }
  if (!revealed) room.measureSpace()
  await nextTick()
  const top = root.value?.getBoundingClientRect().top
  if (top === undefined) return
  room.claim(top + size.value.row + size.value.panel, revealed ? undefined : top)
  revealed = true
})

useEventListener<KeyboardEvent>(() => document, 'keydown', (event) => {
  if (open.value && event.key === 'Escape') open.value = false
})
useEventListener<PointerEvent>(() => document, 'pointerdown', (event) => {
  if (open.value && event.target instanceof Node && !root.value?.contains(event.target)) open.value = false
})

const height = computed(() => `${size.value.row + (open.value ? size.value.panel : 0)}px`)
defineExpose({ panel, nextTick })
</script>

<template>
  <div
    ref="root"
    :data-field-open="open || folding || undefined"
    :class="cn('group/fm relative w-full', (open || folding) && 'z-50', props.class)"
  >
    <!-- The outline, growing down from the field into the panel, and folding back into it. -->
    <div
      :class="[
        'absolute inset-x-0 top-0 overflow-hidden',
        'rounded-[var(--input-radius,var(--radius-md))] border',
        'border-[color:var(--input-border,transparent)] transition-[height,border-color,box-shadow] ease-emphasized motion-reduce:transition-none',
        'group-hover/fm:border-[color:var(--input-border-hover,var(--color-border-strong))]',
        'group-focus-within/fm:border-[color:var(--input-border-focus,var(--color-border-strong))]',
        'group-has-[[aria-invalid=true]]/fm:border-[color:var(--color-danger)]',
        // A tray, like every field, open or not: the field grows into its panel without changing
        // what it is made of.
        'bg-[color:var(--input-bg,var(--color-surface))]',
        open ? 'shadow-overlay duration-[350ms]' : 'duration-300',
      ]"
      :style="{ height }"
    >
      <div
        ref="panel"
        :inert="!open"
        :class="[
          'absolute inset-x-0',
          open ? 'animate-[blur-in_0.35s_var(--ease-soft)_0.08s_both] motion-reduce:animate-none' : 'invisible opacity-0 transition-[opacity,visibility] duration-150',
        ]"
        :style="{ top: `${size.row}px`, '--field-panel-max-height': panelMax && `${panelMax}px` }"
      >
        <slot name="panel" />
      </div>
    </div>
    <!-- The field itself, over the outline, holding its place in the flow. -->
    <div ref="row" class="relative flex min-h-10 items-center">
      <slot />
    </div>
  </div>
</template>
