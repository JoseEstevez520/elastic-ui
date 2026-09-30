<script setup lang="ts">
import { NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput, NumberFieldRoot } from 'reka-ui'
import { computed, ref, type HTMLAttributes } from 'vue'
import { MinusIcon, PlusIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { useFieldControl } from '../../utils/field'
import { labelFor } from '../../utils/labels'
import { fieldClass } from '../input/input.variants'
import TextMorph from '../text-morph/TextMorph.vue'

/**
 * A number, typed or stepped with − and +, the arrow keys or the wheel. Stepped, its digits roll
 * to the new value by place value (TextMorph), as BadgeCount's; typed, it is a plain field.
 * `formatOptions` reads it as a currency, a percentage or a unit, in the given `locale`.
 */
const props = withDefaults(
  defineProps<{
    min?: number
    max?: number
    step?: number
    formatOptions?: Intl.NumberFormatOptions
    locale?: string
    placeholder?: string
    invalid?: boolean
    disabled?: boolean
    name?: string
    decrementLabel?: string
    incrementLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  { step: 1, decrementLabel: labelFor('decrease'), incrementLabel: labelFor('increase') },
)

const value = defineModel<number | undefined>()
const fieldAttrs = useFieldControl(() => props.invalid)

// Typing shows the field's own text; anything else (the buttons, the keys, the wheel, leaving the
// field) hands it to the rolling digits laid over it.
const typing = ref(false)
const shown = computed(() =>
  value.value === undefined || Number.isNaN(value.value)
    ? ''
    : new Intl.NumberFormat(props.locale, props.formatOptions).format(value.value),
)
const stepKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Enter']
const onKey = (event: KeyboardEvent) => {
  if (stepKeys.includes(event.key)) typing.value = false
  else if (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete') typing.value = true
}

const buttonClass =
  'flex h-full w-10 shrink-0 cursor-pointer items-center justify-center text-fg-muted transition-colors hover:text-fg focus-ring-inset disabled:pointer-events-none disabled:opacity-40'
</script>

<template>
  <NumberFieldRoot
    v-model="value"
    :min="min"
    :max="max"
    :step="step"
    :format-options="formatOptions"
    :locale="locale"
    :disabled="disabled"
    :name="name"
    :class="
      cn(
        fieldClass,
        'flex h-10 items-stretch focus-within:border-[color:var(--input-border-focus,var(--color-fg-muted))] has-[[aria-invalid=true]]:border-[color:var(--color-danger)]',
        disabled && 'cursor-not-allowed opacity-50',
        props.class,
      )
    "
  >
    <NumberFieldDecrement :aria-label="decrementLabel" :class="buttonClass" @pointerdown="typing = false">
      <MinusIcon aria-hidden="true" class="size-4" />
    </NumberFieldDecrement>
    <div class="relative min-w-0 flex-1">
      <NumberFieldInput
        v-bind="fieldAttrs"
        :placeholder="placeholder"
        :class="[
          'size-full bg-transparent text-center tabular-nums outline-none placeholder:text-fg-faint',
          !typing && shown && 'text-transparent caret-[color:var(--color-fg)]',
        ]"
        @keydown="onKey"
        @wheel="typing = false"
        @blur="typing = false"
      />
      <!-- The value as it rolls, over the field's own text, which stays for typing and selecting. -->
      <span
        v-if="!typing && shown"
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 flex items-center justify-center text-ui text-fg tabular-nums"
      >
        <TextMorph :text="shown" />
      </span>
    </div>
    <NumberFieldIncrement :aria-label="incrementLabel" :class="buttonClass" @pointerdown="typing = false">
      <PlusIcon aria-hidden="true" class="size-4" />
    </NumberFieldIncrement>
  </NumberFieldRoot>
</template>
