<script setup lang="ts">
import { useId, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

/**
 * A folder, drawn as FileIcon draws a page: tinted in a colour, with its front flap that folds
 * open when `open` (its edges travel as IconMorph's strokes do), so a folder that unfolds shows it.
 * The colour is any CSS colour, the neutral grey by default. Size it with `size` or, given as an
 * icon to a part that sizes its icons, with `class`.
 */
const props = withDefaults(
  defineProps<{
    open?: boolean
    /** Any CSS colour. */
    color?: string
    size?: 'xs' | 'sm' | 'md' | 'lg'
    class?: HTMLAttributes['class']
  }>(),
  { size: 'md' },
)

const sizes = { xs: 'h-[14px] w-[17px]', sm: 'h-[21px] w-[26px]', md: 'h-8 w-10', lg: 'h-[42px] w-[52px]' }
// The back's shape clips the front, so the corners agree.
const clip = useId()

const CLOSED = 'M0 25.5L0 9.5L32 9.5L32 25.5Z'
const OPEN = 'M0 25.5L4.5 12.5L32.5 12.5L32 25.5Z'
</script>

<template>
  <span
    aria-hidden="true"
    :class="cn('relative inline-block shrink-0', sizes[size], props.class)"
    :style="{ '--kind': props.color ?? 'var(--color-fg-muted)' }"
  >
    <svg viewBox="0 0 32 26" class="size-full overflow-visible">
      <defs>
        <clipPath :id="clip">
          <path d="M3.5 .5h8.6l3.2 3.5H28.5a3 3 0 0 1 3 3V22.5a3 3 0 0 1-3 3H3.5a3 3 0 0 1-3-3V3.5a3 3 0 0 1 3-3Z" />
        </clipPath>
      </defs>
      <!-- The back, with its tab. -->
      <path
        d="M3.5 .5h8.6l3.2 3.5H28.5a3 3 0 0 1 3 3V22.5a3 3 0 0 1-3 3H3.5a3 3 0 0 1-3-3V3.5a3 3 0 0 1 3-3Z"
        class="fill-[color:color-mix(in_oklab,var(--kind)_22%,var(--color-bg))] stroke-[color:color-mix(in_oklab,var(--kind)_46%,var(--color-bg))]"
        stroke-width="1"
      />
      <!-- The front flap: flat when closed, leaning away when open. -->
      <g :clip-path="`url(#${clip})`">
        <path
          :style="{ d: `path('${open ? OPEN : CLOSED}')` }"
          class="fill-[color:color-mix(in_oklab,var(--kind)_38%,var(--color-bg))] stroke-[color:color-mix(in_oklab,var(--kind)_46%,var(--color-bg))] transition-[d] duration-[350ms] ease-emphasized motion-reduce:transition-none"
          stroke-width="1"
          stroke-linejoin="round"
        />
      </g>
    </svg>
  </span>
</template>
