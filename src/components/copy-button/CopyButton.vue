<script setup lang="ts">
import { onBeforeUnmount, ref, type HTMLAttributes } from 'vue'
import Button from '../button/Button.vue'
import type { ButtonVariants } from '../button/button.variants'
import IconSwap from '../icon-swap/IconSwap.vue'
import TextMorph from '../text-morph/TextMorph.vue'
import { CheckIcon, CopyIcon } from '../../icons/internal'

/**
 * Copies `value` to the clipboard. Its icon turns into a check once copied, and back after a
 * moment; screen readers hear that it was copied.
 */
const props = withDefaults(
  defineProps<{
    value: string
    /** Accessible name, and the label beside the icon when not `size="icon"`. */
    label?: string
    copiedLabel?: string
    variant?: ButtonVariants['variant']
    size?: ButtonVariants['size']
    class?: HTMLAttributes['class']
  }>(),
  { label: 'Copy', copiedLabel: 'Copied', variant: 'ghost', size: 'icon' },
)
const emit = defineEmits<{ copied: [] }>()

// Long enough to read the check, short enough to copy again soon after.
const SHOWN = 2000
const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  await navigator.clipboard.writeText(props.value)
  copied.value = true
  emit('copied')
  clearTimeout(timer)
  timer = setTimeout(() => (copied.value = false), SHOWN)
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <Button
    :variant="variant"
    :size="size"
    :aria-label="size === 'icon' ? (copied ? copiedLabel : label) : undefined"
    :class="props.class"
    @click="copy"
  >
    <IconSwap :icon="copied ? CheckIcon : CopyIcon" />
    <TextMorph v-if="size !== 'icon'" :text="copied ? copiedLabel : label" />
    <span class="sr-only" aria-live="polite">{{ copied ? copiedLabel : '' }}</span>
  </Button>
</template>
