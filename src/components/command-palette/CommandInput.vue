<script setup lang="ts">
import { ListboxFilter } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import { useCommandPaletteContext } from './command-palette.context'
import { commandIconClass, commandInputClass, commandInputRowClass } from './command-palette.variants'

/** The field the palette filters by. Arrows move through the results while focus stays here. */
const props = withDefaults(defineProps<{ placeholder?: string; class?: HTMLAttributes['class'] }>(), {
  placeholder: labelFor('commandPlaceholder'),
})

const { query } = useCommandPaletteContext()
</script>

<template>
  <div :class="cn(commandInputRowClass, props.class)">
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="commandIconClass">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
    <ListboxFilter
      v-model="query"
      auto-focus
      :placeholder="placeholder"
      :aria-label="placeholder"
      autocomplete="off"
      spellcheck="false"
      :class="commandInputClass"
    />
  </div>
</template>
