<script setup lang="ts">
import { computed, type Component, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

/**
 * Internal: an icon that turns into another when `icon` changes, as transitions.dev swaps its icons: the old
 * one shrinks away as it blurs out and the new one grows in as it comes into focus, both in the
 * same place and at the same time. The first icon just shows. Size it with `class`, as an icon.
 */
const props = defineProps<{
  icon: Component
  class?: HTMLAttributes['class']
}>()

// Each icon component gets a stable key, so a new one replaces the last rather than patching it.
const ids = new WeakMap<object, number>()
let next = 0
const key = computed(() => {
  if (!ids.has(props.icon)) ids.set(props.icon, next++)
  return ids.get(props.icon)
})
</script>

<template>
  <span aria-hidden="true" :class="cn('inline-grid size-4 shrink-0 place-items-center', props.class)">
    <Transition
      enter-from-class="scale-25 opacity-0 blur-[2px]"
      leave-to-class="scale-25 opacity-0 blur-[2px]"
      enter-active-class="transition-[scale,opacity,filter] duration-[250ms] ease-in-out motion-reduce:transition-none"
      leave-active-class="transition-[scale,opacity,filter] duration-[250ms] ease-in-out motion-reduce:transition-none"
    >
      <!-- Both icons share one grid cell while they swap. -->
      <component :is="icon" :key="key" class="[grid-area:1/1] size-full" />
    </Transition>
  </span>
</template>
