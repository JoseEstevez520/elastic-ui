<script setup lang="ts">
import { ToggleGroupItem } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import IconMorph from '../icon-morph/IconMorph.vue'
import type { IconMorphName } from '../icon-morph'
import { useToggleGroup } from './toggle.context'
import { toggleVariants } from './toggle.variants'

/** One toggle in a ToggleGroup; name it with `aria-label` when it only has an icon. */
const props = defineProps<{
  value: string
  icon?: IconMorphName
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()
const group = useToggleGroup()
</script>

<template>
  <ToggleGroupItem
    :value="value"
    :disabled="disabled"
    :class="cn(toggleVariants({ size: group?.size.value, in: group?.type.value ?? 'alone' }), props.class)"
  >
    <IconMorph v-if="icon" :icon="icon" />
    <slot />
  </ToggleGroupItem>
</template>
