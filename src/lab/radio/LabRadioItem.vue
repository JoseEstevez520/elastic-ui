<script setup lang="ts">
import { RadioGroupItem } from 'reka-ui'
import { useId, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useLabRadio } from './radio.context'

/**
 * Lab: one choice. Its tray, a small circle set a tone into what holds it; its label, and a line of
 * detail under it. In `cards`, the whole row is the choice, on the surface tone at rest.
 */
const props = defineProps<{
  value: string
  description?: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()
const id = useId()
const { variant } = useLabRadio()

// The tray: the Switch's track tone, set into the page, a row or a raised surface alike (the sunk
// surface is lost on the dark page); a touch deeper on hover. The dot is drawn by the group.
const tray = [
  'mt-0.5 block size-4 shrink-0 rounded-full bg-bg-inset transition-colors duration-150',
  'group-aria-[invalid=true]/radios:shadow-[inset_0_0_0_1px_var(--color-danger)]',
]
</script>

<template>
  <RadioGroupItem
    v-if="variant === 'cards'"
    :id="id"
    :value="value"
    :disabled="disabled"
    :aria-describedby="description ? `${id}-detail` : undefined"
    :class="
      cn(
        'group/item relative flex w-full cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] px-3.5 py-3 text-left text-ui text-fg',
        // Its resting tone sits under the raised surface that slides between rows.
        'before:absolute before:inset-0 before:-z-20 before:rounded-[inherit] before:bg-surface',
        'focus-ring disabled:cursor-not-allowed disabled:text-fg-faint',
        props.class,
      )
    "
  >
    <span data-radio-tray :class="[tray, 'group-hover/item:bg-[color:color-mix(in_oklab,var(--color-bg-inset),var(--color-fg)_8%)]']" />
    <span class="flex min-w-0 flex-col gap-0.5">
      <span class="text-label"><slot /></span>
      <span v-if="description" :id="`${id}-detail`" class="text-meta text-fg-muted">{{ description }}</span>
    </span>
  </RadioGroupItem>
  <div v-else :class="cn('group/item flex items-start gap-2.5 text-ui has-disabled:opacity-50', props.class)">
    <RadioGroupItem
      :id="id"
      :value="value"
      :disabled="disabled"
      :aria-describedby="description ? `${id}-detail` : undefined"
      class="shrink-0 cursor-pointer rounded-full focus-ring disabled:cursor-not-allowed"
    >
      <span data-radio-tray :class="[tray, 'group-hover/item:bg-[color:color-mix(in_oklab,var(--color-bg-inset),var(--color-fg)_8%)]']" />
    </RadioGroupItem>
    <label :for="id" class="flex cursor-pointer flex-col gap-0.5 text-fg">
      <slot />
      <span v-if="description" :id="`${id}-detail`" class="text-meta text-fg-muted">{{ description }}</span>
    </label>
  </div>
</template>
