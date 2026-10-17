<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useLabels } from '../../utils/labels'
import { suggestionMenuEmptyClass } from './suggestion-menu.variants'

/** What the menu says when nothing matches what was typed; the library's words by default. */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
const labels = useLabels()
</script>

<template>
  <p :class="cn(suggestionMenuEmptyClass, props.class)">
    <slot>{{ labels.nothingMatches }}</slot>
  </p>
</template>
