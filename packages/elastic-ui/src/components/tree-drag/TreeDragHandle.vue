<script setup lang="ts">
import { inject, type HTMLAttributes } from 'vue'
import { GripIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import Button from '../button/Button.vue'
import { TreeDragItemKey, useTreeDragContext, type TreeDragKey } from './tree-drag.context'

/**
 * The grip that moves a `TreeDragItem`: drag it with the pointer, or press Alt with the arrows
 * while it has focus (up and down among its siblings, left out of its section, right into the
 * section above).
 */
const props = withDefaults(defineProps<{ label?: string; class?: HTMLAttributes['class'] }>(), {
  label: labelFor('moveItem'),
})

const context = useTreeDragContext()
const item = inject(TreeDragItemKey)
if (!item) throw new Error('TreeDragHandle goes inside a TreeDragItem')

const keys: Record<string, TreeDragKey> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'out', ArrowRight: 'in' }
function onKeydown(event: KeyboardEvent) {
  const key = keys[event.key]
  if (!event.altKey || !key) return
  event.preventDefault()
  context.step(item!.id, key)
}
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    :icon="GripIcon"
    :aria-label="label"
    aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight"
    :class="cn('size-6 cursor-grab touch-none active:cursor-grabbing', props.class)"
    @pointerdown="context.start(item!.id, $event)"
    @keydown="onKeydown"
  />
</template>
