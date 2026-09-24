<script setup lang="ts">
import { computed, type Component } from 'vue'
import { AlertIcon, CheckIcon, ChevronRightIcon } from '../../icons/internal'
import IconSwap from '../icon-swap/IconSwap.vue'
import ProgressButton, { type ProgressButtonState } from '../progress-button/ProgressButton.vue'
import TextMorph from '../text-morph/TextMorph.vue'

/**
 * Internal: the ways ComposeMorph can offer to send, from the most present to the least.
 *
 *   button    a solid ProgressButton with its label.
 *   ghost     the same with no fill, taking the accent once there is something to send.
 *   icon      the icon alone, a chevron by default, with no fill: faint while there is nothing to
 *             send, the text colour once there is, the accent under the pointer; sending, a fine
 *             ring runs round it; sent, it turns into a check.
 *   link      a small "Send →" in the accent, as a quiet text action.
 *   shortcut  no button at all, only the hint that ⌘↵ sends (`⌘↵ Send`, in the label's own words).
 */
export type ComposeSendStyle = 'button' | 'ghost' | 'icon' | 'link' | 'shortcut'

const props = defineProps<{
  look: ComposeSendStyle
  state: ProgressButtonState
  ready: boolean
  label: string
  workingLabel: string
  doneLabel: string
  errorLabel: string
  /** The `icon` look's icon. */
  icon?: Component
}>()
const emit = defineEmits<{ send: [] }>()

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)
const shortcut = isMac ? '⌘↵' : 'Ctrl+↵'

const phase = computed(() => {
  if (props.state === 'working') return `${props.workingLabel}…`
  if (props.state === 'done') return props.doneLabel
  if (props.state === 'error') return props.errorLabel
  return props.label
})
const press = () => props.ready && props.state === 'idle' && emit('send')
</script>

<template>
  <ProgressButton
    v-if="look === 'button' || look === 'ghost'"
    :state="state"
    size="sm"
    :variant="look === 'button' ? 'solid' : 'ghost'"
    :class="look === 'ghost' && ready && state === 'idle' && 'text-accent'"
    :aria-disabled="!ready || undefined"
    :label="label"
    :working-label="workingLabel"
    :done-label="doneLabel"
    :error-label="errorLabel"
    @click="press"
  />

  <button
    v-else-if="look === 'icon'"
    type="button"
    :aria-label="phase"
    :aria-disabled="!ready || undefined"
    :class="[
      'relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
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

  <button
    v-else-if="look === 'link'"
    type="button"
    :aria-disabled="!ready || undefined"
    :class="[
      'inline-flex cursor-pointer items-center gap-1 text-sm font-medium transition-colors duration-150',
      'focus-visible:outline-2 focus-visible:outline-accent',
      state === 'done'
        ? 'text-[color:var(--color-success)]'
        : state === 'error'
          ? 'text-[color:var(--color-danger)]'
          : ready || state === 'working'
            ? 'text-accent hover:underline'
            : 'cursor-default text-fg-faint',
    ]"
    @click="press"
  >
    <TextMorph :text="phase" />
    <span v-if="state === 'idle'" aria-hidden="true">→</span>
  </button>

  <p v-else :class="['text-xs', state === 'error' ? 'text-[color:var(--color-danger)]' : 'text-fg-faint']" aria-live="polite">
    <TextMorph :text="state === 'idle' ? `${shortcut} ${label}` : phase" />
  </p>
</template>
