<script setup lang="ts">
import { CheckboxIndicator, CheckboxRoot, type CheckboxRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useDelegatedProps } from '../../utils/useDelegatedProps'
import { checkboxBoxClass, checkboxCheckClass, checkboxDashClass } from './checkbox.variants'

/**
 * A box that is checked, unchecked or in between (`'indeterminate'`), with its label in the
 * default slot. Checking fills it with the accent and draws the check along its stroke. Behavior
 * and accessibility come from Reka UI.
 */
const props = defineProps<Omit<CheckboxRootProps, 'modelValue'> & { class?: HTMLAttributes['class'] }>()
const checked = defineModel<boolean | 'indeterminate'>({ default: false })
const delegated = useDelegatedProps(props)
</script>

<template>
  <label :class="cn('inline-flex cursor-pointer items-start gap-2.5 text-sm text-fg has-disabled:cursor-not-allowed has-disabled:opacity-50', props.class)">
    <CheckboxRoot v-bind="delegated" v-model="checked" :class="checkboxBoxClass">
      <!-- Always there, so the check can be drawn and undrawn rather than switch on and off. -->
      <CheckboxIndicator force-mount class="flex">
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="size-3">
          <!-- Both marks are always there: going from one state to the other, one is undrawn as
               the other is drawn. -->
          <path d="M4 8h8" :class="checkboxDashClass" />
          <path d="m3.5 8.5 3 3 6-7" :class="checkboxCheckClass" />
        </svg>
      </CheckboxIndicator>
    </CheckboxRoot>
    <slot />
  </label>
</template>
