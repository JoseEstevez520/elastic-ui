<script setup lang="ts">
import { MotionConfig, motion } from 'motion-v'
import { computed, useId, type HTMLAttributes } from 'vue'
import { useTheme } from '../../composables/useTheme'
import { cn } from '../../utils/cn'

const props = withDefaults(
  defineProps<{
    storageKey?: string
    lightLabel?: string
    darkLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  { lightLabel: 'Switch to light theme', darkLabel: 'Switch to dark theme' },
)

const { theme, toggle } = useTheme(props.storageKey)
const dark = computed(() => theme.value === 'dark')

// Unique per instance, or a second toggle's <mask> silently shadows the first.
const maskId = `theme-toggle-mask-${useId()}`

const BEAMS = [
  [12, 1, 12, 3],
  [12, 21, 12, 23],
  [4.22, 4.22, 5.64, 5.64],
  [18.36, 18.36, 19.78, 19.78],
  [1, 12, 3, 12],
  [21, 12, 23, 12],
  [4.22, 19.78, 5.64, 18.36],
  [18.36, 5.64, 19.78, 4.22],
] as const

// Icon geometry (sun, beams and moon mask) from Adam Argyle's "Building a theme switch
// component": https://web.dev/articles/building/a-theme-switch-component
// Source: https://github.com/argyleink/gui-challenges (Apache-2.0).
const EASE = [0.32, 0.72, 0, 1] as const
const fromCenter = { transformOrigin: 'center', transformBox: 'fill-box' } as const
</script>

<template>
  <MotionConfig reduced-motion="user">
    <button
      type="button"
      role="switch"
      :aria-checked="dark"
      :aria-label="dark ? lightLabel : darkLabel"
      :class="
        cn(
          'flex size-7 cursor-pointer items-center justify-center rounded-full text-fg-muted transition-colors duration-150 hover:text-fg focus-visible:outline-2 focus-visible:outline-accent',
          props.class,
        )
      "
      @click="toggle"
    >
      <!-- The sun's disc grows into a moon as a second circle slides in over it as a mask,
           while the beams shrink away. -->
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" class="shrink-0">
        <mask :id="maskId">
          <rect x="0" y="0" width="24" height="24" fill="white" />
          <motion.circle
            cy="10"
            r="6"
            fill="black"
            :initial="false"
            :animate="{ cx: dark ? 15 : 24 }"
            :transition="{ duration: 0.5, ease: EASE }"
          />
        </mask>
        <motion.circle
          cx="12"
          cy="12"
          r="6"
          fill="currentColor"
          :mask="`url(#${maskId})`"
          :initial="false"
          :animate="{ scale: dark ? 1.4 : 1 }"
          :transition="{ duration: 0.5, ease: EASE }"
          :style="fromCenter"
        />
        <motion.g
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          :initial="false"
          :animate="{ scale: dark ? 0 : 1, opacity: dark ? 0 : 1, rotate: dark ? -25 : 0 }"
          :transition="{ duration: 0.4, ease: EASE }"
          :style="fromCenter"
        >
          <line v-for="([x1, y1, x2, y2], i) in BEAMS" :key="i" :x1="x1" :y1="y1" :x2="x2" :y2="y2" />
        </motion.g>
      </svg>
    </button>
  </MotionConfig>
</template>
