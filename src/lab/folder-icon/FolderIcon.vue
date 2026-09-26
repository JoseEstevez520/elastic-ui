<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

/**
 * Lab: a folder as the Files app draws it, FileIcon's sibling. A tinted back with its tab, the
 * pages it holds peeking out, and a front of frosted glass in the same tint, through which the
 * pages show softly. Pointed at, or `open`, the pages fan out and rise, each turning a little its
 * own way, while the glass front leans forward from its bottom edge: a folder opening on a desk,
 * where nothing appears that was not already in it.
 */
const props = withDefaults(
  defineProps<{
    /** Its colour; the library's accent by default. */
    color?: string
    /** How many pages peek out, up to three. */
    pages?: number
    open?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { color: 'var(--color-accent)', pages: 3 },
)

// Each page: where it rests, and how it fans out when the folder opens.
const fan = [
  {
    rest: 'rotate-[-2deg]',
    open: 'group-hover/folder:-translate-y-[16%] group-hover/folder:-translate-x-[6%] group-hover/folder:rotate-[-7deg] group-data-[open]/folder:-translate-y-[16%] group-data-[open]/folder:-translate-x-[6%] group-data-[open]/folder:rotate-[-7deg]',
    delay: 'delay-0',
  },
  {
    rest: 'rotate-[1deg]',
    open: 'group-hover/folder:-translate-y-[22%] group-hover/folder:rotate-[1deg] group-data-[open]/folder:-translate-y-[22%] group-data-[open]/folder:rotate-[1deg]',
    delay: 'delay-[30ms]',
  },
  {
    rest: 'rotate-[3deg]',
    open: 'group-hover/folder:-translate-y-[16%] group-hover/folder:translate-x-[6%] group-hover/folder:rotate-[8deg] group-data-[open]/folder:-translate-y-[16%] group-data-[open]/folder:translate-x-[6%] group-data-[open]/folder:rotate-[8deg]',
    delay: 'delay-[60ms]',
  },
]
</script>

<template>
  <span
    aria-hidden="true"
    :data-open="open || undefined"
    :class="cn('group/folder relative inline-block h-16 w-20 shrink-0 [perspective:300px]', props.class)"
    :style="{ '--folder': color }"
  >
    <!-- The back, with its tab: the folder's own colour, a shade deeper than the front. -->
    <svg viewBox="0 0 80 64" class="absolute inset-0 size-full">
      <path
        d="M9 3h17.8a7 7 0 0 1 5.3 2.4l3.2 3.7a7 7 0 0 0 5.3 2.4H71a7 7 0 0 1 7 7V54a7 7 0 0 1-7 7H9a7 7 0 0 1-7-7V10a7 7 0 0 1 7-7Z"
        class="fill-[color:color-mix(in_oklab,var(--folder)_82%,black)]"
      />
    </svg>
    <!-- The pages, peeking out at rest, fanning out as it opens. -->
    <span
      v-for="(page, i) in fan.slice(0, pages)"
      :key="i"
      :class="[
        'absolute inset-x-[16%] top-[20%] h-[62%] origin-bottom rounded-[5px] bg-[color:light-dark(#fff,#e4e4e7)]',
        'shadow-[0_1px_2px_rgb(0_0_0/0.12)] transition-transform duration-[400ms] ease-emphasized motion-reduce:transition-none',
        page.rest,
        page.open,
        page.delay,
      ]"
    />
    <!-- The front: frosted glass in the folder's tint, leaning forward as it opens. -->
    <span
      :class="[
        'absolute inset-x-0 top-[34%] bottom-0 origin-bottom overflow-hidden rounded-[7px]',
        'bg-[color:color-mix(in_oklab,var(--folder)_72%,transparent)] backdrop-blur-[6px]',
        'shadow-[inset_0_1px_0_rgb(255_255_255/0.28),0_1px_3px_rgb(0_0_0/0.1)]',
        'transition-transform duration-[400ms] ease-emphasized motion-reduce:transition-none',
        'group-hover/folder:[transform:rotateX(-22deg)] group-data-[open]/folder:[transform:rotateX(-22deg)]',
      ]"
    >
      <!-- Light across its top, as on glass. -->
      <span class="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
    </span>
  </span>
</template>
