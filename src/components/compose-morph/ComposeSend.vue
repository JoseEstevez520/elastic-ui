<script setup lang="ts">
import type { Component } from 'vue'
import { AlertIcon, CheckIcon, ChevronRightIcon } from '../../icons/internal'
import IconSwap from '../icon-swap/IconSwap.vue'
import type { ProgressButtonState } from '../progress-button/ProgressButton.vue'

/**
 * Internal: ComposeMorph's send button, the icon alone with no fill (a chevron by default).
 * Faint while there is nothing to send, the text colour once there is, the accent under the
 * pointer; sending, a fine ring runs round it; sent, it turns into a check, or an alert if the
 * send failed.
 */
const props = defineProps<{
  state: ProgressButtonState
  ready: boolean
  /** Accessible name for each state. */
  labels: { idle: string; working: string; done: string; error: string }
  icon?: Component
}>()
const emit = defineEmits<{ send: [] }>()

const press = () => props.ready && props.state === 'idle' && emit('send')
</script>

<template>
  <button
    type="button"
    :aria-label="labels[state]"
    :aria-disabled="!ready || undefined"
    :class="[
      'relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200',
      'focus-ring',
      state === 'done'
        ? 'text-[color:var(--color-success)]'
        : state === 'error'
          ? 'text-[color:var(--color-danger)]'
          : ready || state === 'working'
            ? 'text-fg hover:text-accent'
            : 'cursor-default text-fg-faint',
    ]"
    @click="press"
  >
    <!-- Sending, a fine ring runs round the icon. -->
    <svg v-if="state === 'working'" aria-hidden="true" viewBox="0 0 36 36" class="absolute inset-0 size-8 animate-spin text-fg-faint motion-reduce:animate-none">
      <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="24 100" />
    </svg>
    <IconSwap :icon="state === 'done' ? CheckIcon : state === 'error' ? AlertIcon : (icon ?? ChevronRightIcon)" class="size-4" />
  </button>
</template>
