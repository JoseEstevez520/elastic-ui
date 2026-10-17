<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import TextMorph from '../text-morph/TextMorph.vue'
import { badgeCountDigitsClass, badgeCountVariants, badgeVariants, type BadgeVariants } from './badge.variants'

/**
 * A number in a badge, such as unread items. When it changes, its digits roll to the new value
 * by place value (TextMorph), as every changing text in the library does.
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
  <span aria-live="polite" :class="cn(badgeVariants({ variant, size }), badgeCountVariants({ size }), props.class)">
    <TextMorph :text="shown" :class="badgeCountDigitsClass" />
  </span>
</template>
