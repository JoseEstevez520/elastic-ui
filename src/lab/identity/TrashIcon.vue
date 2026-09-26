<script setup lang="ts">
/**
 * Lab: Lucide's trash as an object with a lid: `open`, the lid and its handle lift and tip back on
 * their left hinge, as a bin about to take something, and settle again when it closes.
 */
defineProps<{ open?: boolean }>()
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6M14 11v6" />
    <g
      class="origin-[3px_6px] transition-transform duration-[350ms] ease-emphasized motion-reduce:transition-none"
      :style="{ transform: open ? 'translateY(-1.5px) rotate(-16deg)' : 'none' }"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </g>
  </svg>
</template>
