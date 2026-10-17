<script setup lang="ts">
import { computed } from 'vue'

/**
 * What a row's `count` looks like: a quiet number after the label, and, when a Sidebar is folded to
 * its rail, a small dot on the icon. The real number is always there for screen readers, after the
 * label ("Notes, 2"). Used by NavTreeItem.
 */
const props = defineProps<{ count: number; railed: boolean }>()

const shown = computed(() => (props.count > 9 ? '9+' : String(props.count)))
</script>

<template>
  <span class="sr-only" data-nav-tree-count>, {{ count }}</span>
  <span
    v-show="!railed"
    aria-hidden="true"
    class="ml-2 shrink-0 rounded-full bg-bg-muted px-1.5 text-meta leading-4 text-fg-muted tabular-nums"
  >
    {{ shown }}
  </span>
  <!-- Over the icon's top right corner; the ring cuts it out of the icon behind. -->
  <span
    v-show="railed"
    aria-hidden="true"
    class="pointer-events-none absolute top-1.5 left-5 size-2 rounded-full bg-fg-secondary ring-2 ring-[color:var(--color-bg)]"
  />
</template>
