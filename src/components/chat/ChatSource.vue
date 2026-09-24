<script setup lang="ts">
import { computed, type Component, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { chatSourceClass } from './chat.variants'

/**
 * One source an answer read, as a line of text: the site's mark, its title fading at its edge,
 * and where it comes from. No card; the title brightens under the pointer. Opens in a new tab.
 */
const props = defineProps<{
  title: string
  url: string
  /** The site's mark; without it, the first letter of its domain. */
  icon?: Component
  class?: HTMLAttributes['class']
}>()

const domain = computed(() => {
  try {
    return new URL(props.url).hostname.replace(/^www\./, '')
  } catch {
    return props.url
  }
})
</script>

<template>
  <li>
    <a :href="url" target="_blank" rel="noopener noreferrer" :class="cn(chatSourceClass, props.class)">
      <span
        aria-hidden="true"
        class="flex size-4 shrink-0 items-center justify-center rounded-full bg-[color:var(--chat-source-mark,color-mix(in_oklab,var(--color-fg)_8%,transparent))] text-[10px] font-medium text-fg-secondary uppercase"
      >
        <component :is="icon" v-if="icon" class="size-3" />
        <template v-else>{{ domain[0] }}</template>
      </span>
      <span class="mask-fade-r min-w-0 flex-1 overflow-hidden whitespace-nowrap">
        <span class="text-fg-secondary transition-colors duration-150 group-hover/source:text-fg">{{ title }}</span>
        <span class="ml-2 text-xs text-fg-faint">{{ domain }}</span>
      </span>
    </a>
  </li>
</template>
