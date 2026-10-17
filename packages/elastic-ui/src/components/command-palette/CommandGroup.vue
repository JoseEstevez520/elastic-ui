<script setup lang="ts">
import { ListboxGroup, ListboxGroupLabel } from 'reka-ui'
import { useId, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { provideCommandGroup, useCommandPaletteContext } from './command-palette.context'
import { commandGroupHeadingClass } from './command-palette.variants'

/** Items under a heading. Hidden while none of them match. */
const props = defineProps<{ heading?: string; class?: HTMLAttributes['class'] }>()

const id = useId()
provideCommandGroup(id)
const { matching } = useCommandPaletteContext()
</script>

<template>
  <!-- `v-show`, not `v-if`: its items stay mounted to keep counting themselves in. -->
  <ListboxGroup v-show="matching(id) > 0" :class="cn('not-first:mt-1', props.class)">
    <ListboxGroupLabel v-if="heading" :class="commandGroupHeadingClass">{{ heading }}</ListboxGroupLabel>
    <slot />
  </ListboxGroup>
</template>
