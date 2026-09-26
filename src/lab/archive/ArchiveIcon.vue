<script setup lang="ts">
/**
 * Lab: an archive box, BinIcon's sibling. A box has no hinge: `open`, its lid lifts straight up off
 * the box, and the box settles a touch lower, the two parting as a lid lifted off does; closing,
 * the lid comes down onto it again. After lucide-animated's archive, redrawn in the library's way:
 * no stripes, the handle's slot kept, so it reads as a box of records and not as a bin.
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
    <g
      class="transition-transform duration-[350ms] ease-emphasized motion-reduce:transition-none"
      :style="{ transform: open ? 'translateY(1px)' : 'none' }"
    >
      <path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" />
      <path d="M10 13h4" />
    </g>
    <rect
      x="3"
      y="4"
      width="18"
      height="5"
      rx="1"
      class="transition-transform duration-[350ms] ease-emphasized motion-reduce:transition-none"
      :style="{ transform: open ? 'translateY(-3.5px)' : 'none' }"
    />
  </svg>
</template>
