<script setup lang="ts">
import { ListboxFilter } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { SearchIcon } from '../../icons/internal'
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
    <SearchIcon aria-hidden="true" :class="commandIconClass" />
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
