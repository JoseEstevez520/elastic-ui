<script setup lang="ts">
import { animate } from 'motion-v'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { prefersReducedMotion } from '../../utils/motion'

/**
 * Lab: a download told by its own icon, an arrow over a tray, after Aaron Iker's download button
 * and Safari's downloads. While it works, the arrow's stem shortens towards its head as the amount
 * climbs; done, the arrow drops into the tray and the tray fills a tone: it holds the file. Back
 * at rest, the tray empties and the arrow comes down into place again. Failed, the stem grows back
 * and nothing lands. Parts that move as parts, no check swapped in (DECISIONS, Philosophy 5).
 */
const props = defineProps<{
  state: 'idle' | 'working' | 'done' | 'error'
  /** 0 to 100 while working. */
  progress?: number
}>()

// The stem's top, from its full length (y 3) to a stub over the head (y 11). It glides to each
// new amount on the same pace as ProgressButton's count, so steps run together.
const TOP = 3
const STUB = 11
const top = ref(TOP)
let gliding: { stop: () => void } | undefined
const target = computed(() =>
  props.state === 'working' ? TOP + ((STUB - TOP) * Math.min(100, Math.max(0, props.progress ?? 0))) / 100 : TOP,
)
watch(
  target,
  (to) => {
    gliding?.stop()
    if (prefersReducedMotion() || props.state === 'done') return void (top.value = to)
    gliding = animate(top.value, to, { duration: 0.5, ease: 'easeOut', onUpdate: (v) => (top.value = v) })
  },
  { immediate: true },
)
onBeforeUnmount(() => gliding?.stop())

const done = computed(() => props.state === 'done')
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
    class="size-4 overflow-visible"
  >
    <!-- What landed: the tray filling a tone from its floor. -->
    <rect
      x="5"
      y="15"
      width="14"
      height="4"
      rx="1"
      stroke="none"
      fill="currentColor"
      :class="[
        'origin-bottom [transform-box:fill-box] motion-reduce:transition-none',
        done
          ? 'scale-y-100 opacity-35 transition-[scale,opacity] delay-200 duration-300 ease-emphasized'
          : 'scale-y-0 opacity-0 transition-[scale,opacity] duration-200 ease-out',
      ]"
    />
    <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
    <!-- The arrow: done, it falls into the tray, gathering speed, and is gone as it lands; back at
         rest, it comes down into its place from above. -->
    <g
      :class="[
        'motion-reduce:transition-none',
        done
          ? 'translate-y-[6px] opacity-0 transition-[translate,opacity] duration-300 ease-in'
          : 'translate-y-0 opacity-100 transition-[translate,opacity] duration-400 ease-out starting:-translate-y-[6px] starting:opacity-0',
      ]"
    >
      <path :d="`M12 ${top.toFixed(2)}V14`" />
      <path d="M7.5 9.5 12 14l4.5-4.5" />
    </g>
  </svg>
</template>
