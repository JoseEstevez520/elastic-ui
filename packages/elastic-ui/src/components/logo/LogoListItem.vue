<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import Logo from './Logo.vue'
import type { LogoIcon } from './logo.utils'
import { useLogoListContext } from './logo-list.context'

/** One technology in a LogoList: its logo (as Logo takes it) and its name, in the default slot. */
const props = defineProps<{
  icon?: LogoIcon
  src?: string
  mono?: boolean
  class?: HTMLAttributes['class']
}>()

const { bare } = useLogoListContext()
</script>

<template>
  <!-- A tone off the page, not an outline; or nothing under it at all. -->
  <li
    :class="
      cn(
        'flex items-center gap-2 text-ui text-fg-secondary',
        !bare && 'rounded-[var(--radius-lg)] bg-[color:var(--logo-list-bg,var(--color-bg-subtle))] px-3 py-1.5',
        props.class,
      )
    "
  >
    <Logo v-if="icon || src" :icon="icon" :src="src" :mono="mono" alt="" class="size-4.5" />
    <slot />
  </li>
</template>
