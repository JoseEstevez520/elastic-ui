<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import SplitActionsColumn from './SplitActionsColumn.vue'
import SplitActionsDrops from './SplitActionsDrops.vue'
import SplitActionsRing from './SplitActionsRing.vue'
import type { SplitAction, SplitActionsLayout } from './split-actions.types'

/**
 * A button that splits, where it is, into two to four actions each clear from its icon alone
 * (share to…, react, a floating button's new things); actions that need a word are PopoverMorph's
 * menu. Pressing it again, choosing an action, Escape or a click elsewhere folds them back, the
 * icons going first; opened from the keyboard, the first action takes the focus and the arrow keys
 * move between them. Four ways to split, one object each:
 *
 *   `row`     drops pull out of the pill beside it, as liquid (DECISIONS, "Morph or liquid");
 *   `fan`     a round button lets go of drops fanned out above it;
 *   `ring`    a round button grows into a ring round itself, split into one segment per action by
 *             gaps of the page, the one pointed at rising a tone and naming itself above (after
 *             Rauno Freiberg's radial menu); it needs room all round;
 *   `column`  a round button grows up into a pill split in two tones, its actions' part with a
 *             tail pointing at the button, as ConfirmButton's question; for a corner.
 *
 * In `ring` and `column` the button is a plus that turns into its close (IconMorph), so `icon` is
 * only for `row` and `fan`.
 */
const props = withDefaults(
  defineProps<{
    label: string
    icon?: Component
    actions: SplitAction[]
    layout?: SplitActionsLayout
    class?: HTMLAttributes['class']
  }>(),
  { layout: 'row' },
)
const emit = defineEmits<{ select: [action: SplitAction] }>()
</script>

<template>
  <SplitActionsRing
    v-if="layout === 'ring'"
    :label="label"
    :actions="actions"
    :class="props.class"
    @select="emit('select', $event)"
  />
  <SplitActionsColumn
    v-else-if="layout === 'column'"
    :label="label"
    :actions="actions"
    :class="props.class"
    @select="emit('select', $event)"
  />
  <SplitActionsDrops
    v-else
    :label="label"
    :icon="icon!"
    :actions="actions"
    :layout="layout"
    :class="props.class"
    @select="emit('select', $event)"
  />
</template>
