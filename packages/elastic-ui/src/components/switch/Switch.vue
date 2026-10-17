<script setup lang="ts">
import { SwitchRoot, SwitchThumb, type SwitchRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useDelegatedProps } from '../../utils/useDelegatedProps'
import { switchThumbClass, switchTrackClass } from './switch.variants'

/**
 * An on/off switch, with its label in the default slot. The knob slides across with the library's
 * ease while the track takes the accent. Behavior and accessibility come from Reka UI.
 */
const props = defineProps<Omit<SwitchRootProps, 'modelValue'> & { class?: HTMLAttributes['class'] }>()
const on = defineModel<boolean>({ default: false })
const delegated = useDelegatedProps(props)
</script>

<template>
  <label :class="cn('inline-flex cursor-pointer items-start gap-2.5 text-ui text-fg has-disabled:cursor-not-allowed has-disabled:opacity-50', props.class)">
    <SwitchRoot v-bind="delegated" v-model="on" :class="switchTrackClass">
      <SwitchThumb :class="switchThumbClass" />
    </SwitchRoot>
    <slot />
  </label>
</template>
