<script setup lang="ts">
import { RadioGroupIndicator, RadioGroupItem } from 'reka-ui'
import { useId, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { radioCircleClass, radioDotClass } from './radio-group.variants'

/** One choice: its circle and its label, and a line of detail under it if it needs one. */
const props = defineProps<{
  value: string
  /** A line under the label, quieter. */
  description?: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()

const id = useId()
</script>

<template>
  <div :class="cn('flex items-start gap-2.5 text-sm has-disabled:opacity-50', props.class)">
    <RadioGroupItem :id="id" :value="value" :disabled="disabled" :aria-describedby="description ? `${id}-detail` : undefined" :class="radioCircleClass">
      <!-- Always there, so the dot can grow and shrink rather than switch on and off. -->
      <RadioGroupIndicator force-mount class="flex">
        <span :class="radioDotClass" />
      </RadioGroupIndicator>
    </RadioGroupItem>
    <label :for="id" class="flex cursor-pointer flex-col gap-0.5 text-fg has-disabled:cursor-not-allowed">
      <slot />
      <span v-if="description" :id="`${id}-detail`" class="text-xs text-fg-muted">{{ description }}</span>
    </label>
  </div>
</template>
