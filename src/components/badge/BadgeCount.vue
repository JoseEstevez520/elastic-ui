<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { badgeCountClass, badgeCountDigitsClass, badgeCountVariants, badgeVariants, type BadgeVariants } from './badge.variants'

/**
 * A number in a badge, such as unread items. When it changes, the old number blurs out upwards
 * and the new one comes in from below, both in the same cell, so the badge never jumps in size
 * mid-change beyond the digits it needs.
 */
const props = withDefaults(
  defineProps<{
    value: number
    /** Past this, shows `max+`. */
    max?: number
    variant?: BadgeVariants['variant']
    size?: BadgeVariants['size']
    class?: HTMLAttributes['class']
  }>(),
  { max: 99, variant: 'solid' },
)

const shown = computed(() => (props.value > props.max ? `${props.max}+` : String(props.value)))
</script>

<template>
  <span :class="cn(badgeVariants({ variant, size }), badgeCountVariants({ size }), props.class)">
    <span :class="badgeCountClass" aria-live="polite">
      <Transition
        enter-from-class="translate-y-[60%] opacity-0 blur-[2px]"
        leave-to-class="-translate-y-[60%] opacity-0 blur-[2px]"
        enter-active-class="transition-[translate,opacity,filter] duration-300 ease-emphasized motion-reduce:transition-none"
        leave-active-class="transition-[translate,opacity,filter] duration-200 ease-emphasized motion-reduce:transition-none"
      >
        <!-- Both numbers share one grid cell while they swap. -->
        <span :key="shown" :class="badgeCountDigitsClass">{{ shown }}</span>
      </Transition>
    </span>
  </span>
</template>
