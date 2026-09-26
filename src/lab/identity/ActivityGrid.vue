<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, type Component } from 'vue'
import { ChevronRightIcon } from '../../icons/internal'
import { contentOut, prefersReducedMotion } from '../../utils/motion'

/**
 * Lab: a term's activity, day by day, as GitHub's grid, and what it was made of. The card is an
 * object of its own: a frame in the page's strongest tone, the grid of days filling it, and a tray
 * set into its foot naming where the work went, their icons in a stack. Pressed, the tray grows up
 * over the grid into the list, as frosted glass through which the grid still shows; each icon
 * travels from the stack to its own row, and the names and counts come into focus beside them.
 * Closing, the words fade first, the icons travel back, and the tray sinks to its place.
 */
export interface ActivitySource {
  name: string
  count: number
  icon: Component
  /** The tile behind its icon. */
  color: string
}
const props = defineProps<{
  title: string
  /** One level per day (0 to 4), oldest first, a column per week. */
  days: number[]
  /** The first day's date, for the months above the grid. */
  start: Date
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
    words.value = false
    timer = setTimeout(() => (open.value = false), prefersReducedMotion() ? 0 : contentOut.duration * 1000)
  }
}

const weeks = computed(() => {
  const out: number[][] = []
  for (let i = 0; i < props.days.length; i += 7) out.push(props.days.slice(i, i + 7))
  return out
})
// A month's name over the week it starts in.
const months = computed(() =>
  weeks.value.map((_, w) => {
    const day = new Date(props.start)
    day.setDate(day.getDate() + w * 7)
    const before = new Date(day)
    before.setDate(before.getDate() - 7)
    return w === 0 || day.getMonth() !== before.getMonth() ? day.toLocaleString('en', { month: 'short' }) : ''
  }),
)
// The five levels: the activity's colour, from a trace to full.
const level = ['9%', '30%', '52%', '75%', '100%']

// The tray at rest, and grown: as tall as every row needs, and at least the card's inner height.
const card = useTemplateRef<HTMLElement>('card')
const TRAY = 52
const ROW = 44
const INSET = 12
const listHeight = computed(() => TRAY + props.sources.length * ROW + 16)
const grown = ref(TRAY)
onMounted(() => (grown.value = Math.max((card.value?.clientHeight ?? 240) - INSET * 2, listHeight.value)))

// Each icon: stacked, overlapping, at the tray's right beside the chevron; or at the start of its row.
const ICON = 32
const iconAt = (i: number) =>
  open.value
    ? { top: `${TRAY + i * ROW + (ROW - ICON) / 2}px`, left: '16px', zIndex: 1 }
    : {
        top: `${(TRAY - ICON) / 2}px`,
        left: `calc(100% - ${16 + 32 + 10 + ICON + (props.sources.length - 1 - i) * 20}px)`,
        zIndex: i + 1,
      }
</script>

<template>
  <section
    ref="card"
    class="relative w-[30rem] max-w-full rounded-[28px] bg-[color:light-dark(#fff,#000)] p-3 shadow-[0_1px_2px_rgb(0_0_0/0.04)]"
  >
    <div class="px-3 pt-3" :style="{ paddingBottom: `${TRAY + 16}px`, minHeight: `${listHeight}px` }">
      <h3 class="text-[17px] text-fg">{{ title }}</h3>
      <div class="mt-4" aria-hidden="true">
        <div class="flex gap-[3px] text-[11px] tracking-wide text-fg-faint">
          <span v-for="(m, w) in months" :key="w" class="h-4 flex-1 overflow-visible whitespace-nowrap">{{ m }}</span>
        </div>
        <div class="mt-1 flex gap-[3px]">
          <div v-for="(week, w) in weeks" :key="w" class="flex flex-1 flex-col gap-[3px]">
            <span
              v-for="(d, i) in week"
              :key="i"
              class="aspect-square w-full rounded-[3px]"
              :style="{
                background: `color-mix(in oklab, var(--activity, var(--color-success)) ${level[d]}, light-dark(#ebebed, #161618))`,
              }"
            />
          </div>
        </div>
      </div>
    </div>
    <!-- The tray set into the card's foot, growing up over the grid as frosted glass. -->
    <div
      :class="[
        'absolute right-3 bottom-3 left-3 overflow-hidden rounded-[20px]',
        // Nearly opaque, so the grid only just shows through once the tray has grown over it.
        'bg-[color:light-dark(rgb(236_236_238/0.9),rgb(22_22_24/0.9))] backdrop-blur-xl',
        open
          ? 'transition-[height] duration-[500ms] ease-in-out'
          : 'transition-[height] duration-[450ms] ease-emphasized',
        'motion-reduce:transition-none',
      ]"
      :style="{ height: `${open ? grown : TRAY}px` }"
    >
      <button
        type="button"
        :aria-expanded="open"
        class="flex w-full cursor-pointer items-center justify-between pr-2.5 pl-4 text-left text-[15px] text-fg-secondary focus-ring-inset"
        :style="{ height: `${TRAY}px` }"
        @click="toggle"
      >
        {{ summary ?? 'Most active in' }}
        <span
          class="flex size-8 items-center justify-center rounded-full shadow-[inset_0_0_0_1.5px_var(--color-border-strong)]"
        >
          <ChevronRightIcon
            aria-hidden="true"
            :class="[
              'size-4 text-fg-muted transition-transform duration-[450ms] ease-emphasized',
              open ? '-rotate-90' : 'rotate-90',
            ]"
          />
        </span>
      </button>
      <!-- Each source's icon, travelling between the stack and its row. -->
      <span
        v-for="(s, i) in sources"
        :key="s.name"
        aria-hidden="true"
        class="absolute flex items-center justify-center rounded-full text-white ring-2 ring-[color:light-dark(#fff,#000)] transition-[top,left] duration-[450ms] ease-emphasized motion-reduce:transition-none"
        :style="{
          ...iconAt(i),
          width: `${ICON}px`,
          height: `${ICON}px`,
          background: s.color,
          // Going out, a slower, even glide one after another, so the icons drift to their rows rather
          // than shoot; coming back keeps the quicker fold.
          transition: open
            ? `top 600ms var(--ease-in-out) ${80 + i * 60}ms, left 600ms var(--ease-in-out) ${80 + i * 60}ms`
            : `top 450ms var(--ease-emphasized) ${(sources.length - 1 - i) * 25}ms, left 450ms var(--ease-emphasized) ${(sources.length - 1 - i) * 25}ms`,
        }"
      >
        <component :is="s.icon" class="size-4" :stroke-width="2.25" />
      </span>
      <!-- The names and counts, in focus once the list is open, gone before it closes. -->
      <!-- Each row's words come into focus once its icon has passed over them on its way to the row's
           start, so nothing crosses the text; they all fade at once before it closes. -->
      <ul :class="!words && 'opacity-0 transition-opacity duration-150'" class="pr-4 pl-[60px]">
        <li
          v-for="(s, i) in sources"
          :key="s.name"
          class="flex items-center justify-between text-[15px]"
          :style="{
            height: `${ROW}px`,
            animation: words ? `blur-in 0.45s var(--ease-soft) ${80 + i * 60 + 480}ms both` : 'none',
          }"
        >
          <span class="text-fg">{{ s.name }}</span>
          <span class="text-fg-muted tabular-nums">{{ s.count }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
