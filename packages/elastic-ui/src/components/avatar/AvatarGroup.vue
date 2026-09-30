<script setup lang="ts">
import { Comment, Fragment, computed, useSlots, type HTMLAttributes, type VNode } from 'vue'
import { cn } from '../../utils/cn'
import Tooltip from '../tooltip/Tooltip.vue'
import TooltipGroup from '../tooltip/TooltipGroup.vue'
import { avatarGroupItemVariants, avatarVariants, type AvatarSize } from './avatar.variants'

/**
 * Several people in a row, overlapping. They just overlap, with no ring round each (a ring in the
 * page's colour reads as a cut-out sticker). Hovered or focused, the row opens out so each face
 * shows whole, and each one's name comes up as a tooltip. Past `max`, the rest are counted in a
 * circle of the same size.
 */
const props = withDefaults(
  defineProps<{
    /** How many avatars show; the rest are counted. */
    max?: number
    /** For every avatar in it. */
    size?: AvatarSize
    class?: HTMLAttributes['class']
  }>(),
  { size: 'md' },
)
const slots = useSlots()

// The avatars given, through any `v-for` fragments, without comments.
function flatten(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) =>
    node.type === Fragment ? flatten(node.children as VNode[]) : node.type === Comment ? [] : [node],
  )
}
const avatars = computed(() => flatten(slots.default?.() ?? []))
const shown = computed(() => (props.max === undefined ? avatars.value : avatars.value.slice(0, props.max)))
const rest = computed(() => avatars.value.length - shown.value.length)
const nameOf = (node: VNode) => (node.props?.name as string | undefined) ?? (node.props?.alt as string | undefined)
</script>

<template>
  <TooltipGroup>
    <div :class="cn('group/avatars inline-flex items-center', props.class)">
      <template v-for="(avatar, i) in shown" :key="avatar.key ?? i">
        <Tooltip :content="nameOf(avatar)" :disabled="!nameOf(avatar)">
          <span
            :tabindex="nameOf(avatar) ? 0 : undefined"
            :class="[avatarGroupItemVariants({ size }), 'rounded-full focus-ring']"
          >
            <component :is="avatar" :size="size" />
          </span>
        </Tooltip>
      </template>
      <span
        v-if="rest > 0"
        :class="[
          avatarGroupItemVariants({ size }),
          avatarVariants({ size }),
          'text-meta tabular-nums text-fg-secondary',
        ]"
      >
        +{{ rest }}
      </span>
    </div>
  </TooltipGroup>
</template>
