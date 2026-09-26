<script setup lang="ts">
import { animate, motion, useMotionValue, useTransform } from 'motion-v'
import {
  PaginationEllipsis,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
  PaginationRoot,
} from 'reka-ui'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import { EASE_EMPHASIZED, prefersReducedMotion } from '../../utils/motion'
import TextMorph from '../text-morph/TextMorph.vue'
import {
  paginationClass,
  paginationEllipsisClass,
  paginationItemClass,
  paginationMarkClass,
  paginationStepClass,
} from './pagination.variants'

/**
 * Pages of a list, as quiet numbers between two chevrons. The current page is marked by one
 * surface a tone above the page that slides to the page chosen, as Tabs' pill does. The window of
 * numbers keeps its places (1 … 4 5 6 … 20): moving on inside it, the mark stays in the middle and
 * the numbers roll to their new values (TextMorph), so nothing jumps and nothing is rebuilt; an
 * ellipsis that comes or goes at an end comes into focus. `compact`, for a phone, says "Page 3 of
 * 20" between the chevrons, its number rolling. Keys, ARIA and the window come from Reka UI.
 */
const props = withDefaults(
  defineProps<{
    /** How many items there are, across every page. */
    total: number
    itemsPerPage?: number
    /** How many pages to show on each side of the current one. */
    siblingCount?: number
    /** "Page 3 of 20" between the chevrons instead of the numbers. */
    compact?: boolean
    label?: string
    pageLabel?: string
    /** Between the page and how many there are in `compact`: "Page 3 of 20". */
    ofLabel?: string
    previousLabel?: string
    nextLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  {
    itemsPerPage: 10,
    siblingCount: 1,
    label: labelFor('pagination'),
    pageLabel: labelFor('page'),
    ofLabel: labelFor('of'),
    previousLabel: labelFor('previous'),
    nextLabel: labelFor('next'),
  },
)
const page = defineModel<number>('page', { default: 1 })
const pages = computed(() => Math.max(1, Math.ceil(props.total / props.itemsPerPage)))

// The mark: one surface, its edges travelling to the chosen page's, as TabsList's indicator.
const SLIDE = { duration: 0.45, ease: EASE_EMPHASIZED }
const leftEdge = useMotionValue(0)
const rightEdge = useMotionValue(0)
const width = useTransform(() => rightEdge.get() - leftEdge.get())
const placed = ref(false)
const list = useTemplateRef<InstanceType<typeof PaginationList>>('list')
const listEl = () => list.value?.$el as HTMLElement | undefined

function moveMark(instant: boolean) {
  const current = listEl()?.querySelector<HTMLElement>('[data-selected="true"]')
  if (!current) return
  const left = current.offsetLeft
  const right = left + current.offsetWidth
  if (instant || !placed.value || prefersReducedMotion()) {
    leftEdge.jump(left)
    rightEdge.jump(right)
  } else {
    animate(leftEdge, left, SLIDE)
    animate(rightEdge, right, SLIDE)
  }
  placed.value = true
}
watch(page, () => nextTick(() => moveMark(false)))

let observer: ResizeObserver | undefined
onMounted(() => {
  const el = listEl()
  if (!el) return
  observer = new ResizeObserver(() => moveMark(true))
  observer.observe(el)
  moveMark(true)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <PaginationRoot
    v-model:page="page"
    :total="total"
    :items-per-page="itemsPerPage"
    :sibling-count="siblingCount"
    show-edges
    :aria-label="label"
    :class="cn('flex items-center gap-1', props.class)"
  >
    <PaginationPrev :aria-label="previousLabel" :class="paginationStepClass">
      <ChevronLeftIcon aria-hidden="true" class="size-4" />
    </PaginationPrev>

    <p v-if="compact" class="px-2 text-label text-fg-muted">
      {{ pageLabel }}
      <TextMorph :text="String(page)" class="text-fg tabular-nums" />
      {{ ofLabel }} {{ pages }}
    </p>

    <PaginationList v-else ref="list" v-slot="{ items }" :class="paginationClass">
      <motion.span v-show="placed" aria-hidden="true" :style="{ x: leftEdge, width }" :class="paginationMarkClass" />
      <!-- Keyed by place, not by number: moving on, a place keeps its button and its number rolls. -->
      <template v-for="(item, index) in items" :key="index">
        <PaginationListItem
          v-if="item.type === 'page'"
          :value="item.value"
          :aria-label="`${pageLabel} ${item.value}`"
          :class="paginationItemClass"
        >
          <TextMorph :text="String(item.value)" />
        </PaginationListItem>
        <PaginationEllipsis v-else :index="index" :class="paginationEllipsisClass">…</PaginationEllipsis>
      </template>
    </PaginationList>

    <PaginationNext :aria-label="nextLabel" :class="paginationStepClass">
      <ChevronRightIcon aria-hidden="true" class="size-4" />
    </PaginationNext>
  </PaginationRoot>
</template>
