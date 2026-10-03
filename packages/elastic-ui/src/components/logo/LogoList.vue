<script setup lang="ts">
import { toRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { provideLogoListContext } from './logo-list.context'

/**
 * A row of technologies, each its logo and its name (LogoListItem), to name a stack without
 * spending text. It wraps onto more lines as it needs. `bare` drops the trays, for a list over
 * colour (a Glow), where a tray would cut a hole in it.
 */
const props = defineProps<{
  /** No tray under each item: the logo and its name alone. */
  bare?: boolean
  class?: HTMLAttributes['class']
}>()

provideLogoListContext({ bare: toRef(() => props.bare) })
</script>

<template>
  <ul :class="cn('flex flex-wrap', bare ? 'gap-x-4 gap-y-2' : 'gap-2', props.class)">
    <slot />
  </ul>
</template>
