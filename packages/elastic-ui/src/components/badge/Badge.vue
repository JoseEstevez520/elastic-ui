<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { XIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { useLabels } from '../../utils/labels'
import { badgeLabelVariants, badgeRemoveClass, badgeVariants, type BadgeVariants } from './badge.variants'

const props = defineProps<{
  variant?: BadgeVariants['variant']
  size?: BadgeVariants['size']
  /** Shown before the label. */
  icon?: Component
  /** Any CSS color: a dot before the label, for a status or a category. */
  color?: string
  /**
   * Shows only the icon or the dot, and unfolds the label beside it on hover and keyboard focus.
   * The label stays readable to screen readers while folded.
   */
  compact?: boolean
  /** Adds a button to remove it; listen for `remove`. */
  removable?: boolean
  /** Accessible name of the remove button. */
  removeLabel?: string
  class?: HTMLAttributes['class']
}>()
const emit = defineEmits<{ remove: [] }>()
const labels = useLabels()
</script>

<template>
  <!-- Focusable while compact, so the keyboard can unfold it too. -->
  <span
    :tabindex="compact ? 0 : undefined"
    :class="cn(badgeVariants({ variant, size, compact }), props.class)"
  >
    <span v-if="color" aria-hidden="true" class="size-1.5 shrink-0 rounded-full" :style="{ background: color }" />
    <component :is="icon" v-if="icon" aria-hidden="true" class="size-3.5 shrink-0" />
    <span :class="badgeLabelVariants({ compact })"><slot /></span>
    <button
      v-if="removable"
      type="button"
      :aria-label="removeLabel ?? labels.remove"
      :class="badgeRemoveClass"
      @click="emit('remove')"
    >
      <XIcon aria-hidden="true" class="size-3" />
    </button>
  </span>
</template>
