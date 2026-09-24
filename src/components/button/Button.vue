<script setup lang="ts">
import { computed, type Component, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { buttonVariants, type ButtonVariants } from './button.variants'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariants['variant']
    size?: ButtonVariants['size']
    /** Icon component rendered before the label. */
    icon?: Component
    loading?: boolean
    disabled?: boolean
    /** Renders an `<a>` instead of a `<button>`. */
    href?: string
    type?: 'button' | 'submit' | 'reset'
    class?: HTMLAttributes['class']
  }>(),
  { type: 'button' },
)

const isLink = computed(() => props.href !== undefined)
const isDisabled = computed(() => props.disabled || props.loading)
</script>

<template>
  <component
    :is="isLink ? 'a' : 'button'"
    :href="isLink && !isDisabled ? href : undefined"
    :type="isLink ? undefined : type"
    :disabled="isLink ? undefined : isDisabled"
    :aria-disabled="isLink && isDisabled ? true : undefined"
    :aria-busy="loading || undefined"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <svg
      v-if="loading"
      class="size-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity="0.25" stroke-width="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
    </svg>
    <component :is="icon" v-else-if="icon" class="size-4" aria-hidden="true" />
    <slot />
  </component>
</template>
