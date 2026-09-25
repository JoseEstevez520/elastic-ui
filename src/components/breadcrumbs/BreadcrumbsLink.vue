<script setup lang="ts">
import { useLink, type LinkTo } from '../../utils/link'

// Internal: a crumb or a sibling that goes to its page, through the app's router when it has one.
const props = defineProps<{ to?: LinkTo; href?: string }>()
const link = useLink(props)
</script>

<template>
  <component :is="link?.is ?? 'span'" v-bind="link?.attrs">
    <slot />
  </component>
</template>
