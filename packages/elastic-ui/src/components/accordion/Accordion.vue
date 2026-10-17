<script setup lang="ts">
import { AccordionRoot } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

/**
 * Several sections where opening one can close the others. Sections are separated by hairlines,
 * not boxed. Behavior and accessibility (arrow keys between headers, ARIA) come from Reka UI.
 */
const props = withDefaults(
  defineProps<{
    /** `single`: one section open at a time. `multiple`: any number. */
    type?: 'single' | 'multiple'
    defaultValue?: string | string[]
    /** With `single`, lets the open section be closed again. */
    collapsible?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { type: 'single', collapsible: true },
)

const value = defineModel<string | string[]>()
</script>

<template>
  <!-- Kept mounted while closed, so the browser's find-in-page can still reach the content. -->
  <AccordionRoot
    v-model="value"
    :type="type"
    :default-value="defaultValue"
    :collapsible="collapsible"
    :unmount-on-hide="false"
    :class="cn('flex flex-col', props.class)"
  >
    <slot />
  </AccordionRoot>
</template>
