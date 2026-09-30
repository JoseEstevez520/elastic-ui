<script setup lang="ts">
import { TabsTrigger } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useTabsContext } from './tabs.context'
import { tabsTriggerVariants } from './tabs.variants'

const props = defineProps<{
  value: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()

const { variant } = useTabsContext()
</script>

<template>
  <TabsTrigger :value="value" :disabled="disabled" :class="cn(tabsTriggerVariants({ variant }), props.class)">
    <slot />
  </TabsTrigger>
</template>
