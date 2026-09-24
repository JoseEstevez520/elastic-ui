<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useRequiredSidebarContext } from './sidebar.context'

const props = withDefaults(defineProps<{ label?: string; class?: HTMLAttributes['class'] }>(), {
  label: 'Toggle sidebar',
})

const sidebar = useRequiredSidebarContext('SidebarToggle')
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    :aria-expanded="sidebar.isOpen.value"
    :aria-controls="sidebar.panelId"
    :class="
      cn(
        'flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-md)] text-fg-muted transition-colors hover:bg-bg-muted hover:text-fg',
        'focus-visible:outline-2 focus-visible:outline-accent',
        props.class,
      )
    "
    @click="sidebar.toggle()"
  >
    <!-- A panel with its side column: filled in while the sidebar is open. -->
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-[18px]">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
      <path d="M5.5 8v8" :class="cn('transition-opacity duration-200', !sidebar.isOpen.value && 'opacity-0')" />
    </svg>
  </button>
</template>
