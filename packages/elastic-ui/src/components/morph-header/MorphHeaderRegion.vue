<script setup lang="ts">
import { provideMorphHeaderPlacement, type MorphHeaderPlacement } from './morph-header.context'

// Internal: lets the same slot content render as the inline bar or as the mobile panel.
const props = defineProps<{ placement: MorphHeaderPlacement }>()
provideMorphHeaderPlacement(props.placement)
</script>

<template>
  <slot />
</template>
