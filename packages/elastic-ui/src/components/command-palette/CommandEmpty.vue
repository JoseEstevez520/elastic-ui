<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useLabels } from '../../utils/labels'
import { useCommandPaletteContext } from './command-palette.context'
import { commandEmptyClass } from './command-palette.variants'

/** Shown while nothing matches the query. */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()

const { matching } = useCommandPaletteContext()
const labels = useLabels()
</script>

<template>
  <div v-if="matching() === 0" role="status" :class="cn(commandEmptyClass, props.class)">
    <slot>{{ labels.noResults }}</slot>
  </div>
</template>
