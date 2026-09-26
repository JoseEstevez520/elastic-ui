<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, type Component } from 'vue'
import { ChevronRightIcon } from '../../icons/internal'
import { contentOut, prefersReducedMotion } from '../../utils/motion'

/**
 * Lab: a term's activity, day by day, as GitHub's grid, with what it was made of underneath. At
 * rest, the grid, and below it a quiet bar naming where the work went, their icons in a stack.
 * Pressed, the bar grows up over the grid into the list, lifting into the library's material;
 * each icon travels from the stack to its own row, and the names and counts come into focus
 * beside them. Closing, the words fade first, the icons travel back to the stack, and the bar
 * folds down to its place. Nothing leaves the card.
 */
export interface ActivitySource {
  name: string
  count: number
  icon: Component
  /** Its colour, tinting its icon's tile. */
  color: string
}
const props = defineProps<{
  title: string
  /** One level per day (0 to 4), oldest first, a column per week. */
  days: number[]
  sources: ActivitySource[]
  summary?: string
}>()

const open = ref(false)
const words = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
function toggle() {
  clearTimeout(timer)
  if (!open.value) {
    open.value = true
    words.value = true
  } else {
    // The names go first; then the icons travel back and the bar folds.
    words.value = false
    timer = setTimeout(() => (open.value = false), prefersReducedMotion() ? 0 : contentOut.duration * 1000)
  }
}

const weeks = computed(() => {
  const out: number[][] = []
  for (let i = 0; i < props.days.length; i += 7) out.push(props.days.slice(i, i + 7))
  return out
})
// The five levels, as the accent mixed into the ground.
const level = ['6%', '28%', '48%', '70%', '92%']

// The bar's height at rest, and the list's once open: the card's inner height.
const card = useTemplateRef<HTMLElement>('card')
const BAR = 48
const ROW = 40
const full = ref(BAR)
// Tall enough for every row, and at least the card's inner height, so it covers the grid.
const listHeight = computed(() => BAR + 4 + props.sources.length * ROW + 8)
onMounted(() => (full.value = Math.max((card.value?.clientHeight ?? 200) - 16, listHeight.value)))

// Where each icon is: stacked at the bar's right at rest, at the start of its row once open.
const iconAt = (i: number) =>
  open.value
    ? { top: `${BAR + 4 + i * ROW + (ROW - 28) / 2}px`, left: '12px', zIndex: 1 }
    : {
        top: `${(BAR - 28) / 2}px`,
        left: `calc(100% - 44px - ${(props.sources.length - 1 - i) * 18}px)`,
        zIndex: props.sources.length - i,
      }
</script>

<template>
  <section ref="card" class="relative w-[26rem] max-w-full rounded-[20px] bg-bg-muted p-2">
    <!-- Room kept under the grid for the bar, so it covers nothing at rest. -->
    <div class="px-3 pt-2.5" :style="{ paddingBottom: `${BAR + 12}px`, minHeight: `${listHeight}px` }">
      <h3 class="text-sm font-medium text-fg">{{ title }}</h3>
      <div class="mt-3 flex gap-[3px]" aria-hidden="true">
        <div v-for="(week, w) in weeks" :key="w" class="flex flex-col gap-[3px]">
          <span
            v-for="(d, i) in week"
            :key="i"
            class="size-[10px] rounded-[3px]"
            :style="{ background: `color-mix(in oklab, var(--color-accent) ${level[d]}, var(--color-bg))` }"
          />
        </div>
      </div>
    </div>
    <!-- The bar, which grows up over the grid into the list. -->
    <div
      :class="[
        'absolute inset-x-2 bottom-2 overflow-hidden rounded-[14px] bg-[color:var(--color-bg)]',
        'transition-[height,box-shadow] duration-[450ms] ease-emphasized motion-reduce:transition-none',
        open
          ? 'shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_0_0_1px_var(--color-border),0_8px_24px_-10px_rgb(0_0_0/0.3)]'
          : 'shadow-[inset_0_1px_0_transparent,0_0_0_1px_var(--color-border),0_0_0_0_transparent]',
      ]"
      :style="{ height: `${open ? full : BAR}px` }"
    >
      <button
        type="button"
        :aria-expanded="open"
        class="flex h-12 w-full cursor-pointer items-center justify-between pr-3 pl-4 text-left text-sm text-fg-secondary focus-ring-inset"
        @click="toggle"
      >
        {{ summary ?? 'Most active in' }}
        <ChevronRightIcon
          aria-hidden="true"
          :class="[
            'size-4 text-fg-muted transition-transform duration-[450ms] ease-emphasized',
            open ? '-rotate-90' : 'rotate-90',
          ]"
        />
      </button>
      <!-- Each source's icon, travelling between the stack and its row. -->
      <span
        v-for="(s, i) in sources"
        :key="s.name"
        aria-hidden="true"
        class="absolute flex size-7 items-center justify-center rounded-[9px] ring-2 ring-[color:var(--color-bg)] transition-[top,left] duration-[450ms] ease-emphasized motion-reduce:transition-none"
        :style="{
          ...iconAt(i),
          background: `color-mix(in oklab, ${s.color} 18%, var(--color-bg))`,
          color: s.color,
          transitionDelay: open ? `${i * 30}ms` : '0ms',
        }"
      >
        <component :is="s.icon" class="size-4" />
      </span>
      <!-- The names and counts, in focus once the list is open, gone before it folds. -->
      <ul
        :class="words ? 'stagger-items [--stagger-delay:0.18s]' : 'opacity-0 transition-opacity duration-150'"
        class="pr-4 pl-12"
      >
        <li v-for="s in sources" :key="s.name" class="flex h-10 items-center justify-between text-sm">
          <span class="text-fg">{{ s.name }}</span>
          <span class="text-fg-muted tabular-nums">{{ s.count }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
