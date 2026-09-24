<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
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
      :aria-label="removeLabel ?? 'Remove'"
      :class="badgeRemoveClass"
      @click="emit('remove')"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="size-3">
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    </button>
  </span>
</template>
