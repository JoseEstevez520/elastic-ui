<script setup lang="ts">
import { computed } from 'vue'
import { useSelect } from './select.context'

/** The chosen option's text (several, joined, with `multiple`), or `placeholder` until there is one. */
const props = defineProps<{ placeholder?: string }>()
const select = useSelect()
const text = computed(() => {
  const chosen = ([] as string[]).concat(select.value.value ?? [])
  return chosen.map((v) => select.texts.get(v) ?? v).join(', ')
})
</script>

<template>
  <!-- `min-w-0` lets it shrink inside the trigger's row, so a long label ends in a fade. -->
  <span :class="['min-w-0 truncate', !text && 'text-fg-muted']">{{ text || props.placeholder }}</span>
</template>
