<script setup lang="ts">
/**
 * A bin as an object with a lid, simpler than Lucide's (no stripes), so the lid reads: `open`,
 * the lid and its handle lift and tip well back on their left hinge, as a bin about to take
 * something, and settle again when it closes.
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
    class="overflow-visible"
  >
    <path d="M6 9v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9" />
    <g
      class="origin-[4px_7px] transition-transform duration-[350ms] ease-emphasized motion-reduce:transition-none"
      :style="{ transform: open ? 'translate(1px, -2px) rotate(-28deg)' : 'none' }"
    >
      <path d="M4 7h16" />
      <path d="M9.5 7V5.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5V7" />
    </g>
  </svg>
</template>
