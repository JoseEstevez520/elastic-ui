<script setup lang="ts">
import { ref } from 'vue'
import { provideCardContext } from '../card/card.context'
import {
  provideExpandableCardRegion,
  type ExpandableCardRegionContext,
} from './expandable-card.context'

// Internal: tells the parts inside a head which copy they belong to.
const props = defineProps<ExpandableCardRegionContext>()

provideExpandableCardRegion(props)
provideCardContext({ size: ref('md') })
</script>

<template>
  <slot />
</template>
