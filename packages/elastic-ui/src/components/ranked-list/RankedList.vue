<script setup lang="ts">
import { computed, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import Collapsible from '../collapsible/Collapsible.vue'
import CollapsibleContent from '../collapsible/CollapsibleContent.vue'
import CollapsibleTrigger from '../collapsible/CollapsibleTrigger.vue'
import TextMorph from '../text-morph/TextMorph.vue'
import type { RankedListItem } from './ranked-list.types'

/**
 * A ranking without axes: each row is its own bar, a tray whose fill is the measure, the label
 * and the figure written on it. Meant for the dashboard question "which are the most?", where a
 * Chart's axes would say more than the answer needs.
 *
 * The rows are places, not products. Given the items in a new order (or with new values), nothing
 * travels up or down: the label and the figure in each place turn into the new ones (TextMorph)
 * and the fill eases to its new length. The caller sorts; the list only shows what it is given.
 *
 * With a `detail` slot a row opens in place (Collapsible) to show more about that item, one at a
 * time; `v-model` holds the key of the open one. A new order closes it, since the place it was
 * opened in now holds another item.
 *
 * Grey by design: the fill is neutral, and colour is kept for what a state means. The fill is
 * drawn with `scaleX`, so it only costs a transform. Keep labels short.
 */
const props = defineProps<{
  items: RankedListItem[]
  /** The value a full row stands for. Left out, the largest value fills its row. */
  max?: number
  /** Writes a figure; by default `Intl.NumberFormat` with `locale` and `options`. */
  format?: (value: number) => string
  locale?: string
  options?: Intl.NumberFormatOptions
  /** What the ranking is, for screen readers. */
  label?: string
  class?: HTMLAttributes['class']
}>()

defineSlots<{
  /** What a row opens to show. With it, rows become buttons. */
  detail?: (props: { item: RankedListItem; index: number }) => unknown
}>()

/** The key of the row that is open. */
const open = defineModel<string | null>({ default: null })

const top = computed(() => props.max ?? Math.max(...props.items.map((i) => i.value), 0))
const ratio = (value: number) => (top.value > 0 ? Math.min(1, Math.max(0, value / top.value)) : 0)
const write = (value: number) =>
  props.format ? props.format(value) : new Intl.NumberFormat(props.locale, props.options).format(value)

watch(
  () => props.items.map((i) => i.key).join('\u0000'),
  () => (open.value = null),
)

const rowClass =
  'relative flex h-11 w-full items-center justify-between gap-3 px-3.5 py-0 text-left font-normal text-ui'
</script>

<template>
  <ul :aria-label="label" :class="cn('flex flex-col gap-1.5', props.class)">
    <li v-for="(item, index) in items" :key="index">
      <Collapsible
        :open="open === item.key"
        class="relative overflow-hidden rounded-lg bg-surface transition-colors hover:bg-bg-inset"
        @update:open="open = $event ? item.key : null"
      >
        <span
          aria-hidden="true"
          class="absolute inset-0 origin-left bg-[var(--ranked-list-fill,color-mix(in_oklab,var(--color-fg)_11%,transparent))] transition-transform duration-700 ease-emphasized motion-reduce:transition-none"
          :style="{ transform: `scaleX(${ratio(item.value)})` }"
        />
        <CollapsibleTrigger
          v-if="$slots.detail"
          :chevron="false"
          :class="cn(rowClass, 'focus-visible:outline-offset-[-2px]')"
        >
          <TextMorph :text="item.label" class="min-w-0 whitespace-nowrap text-fg" />
          <TextMorph :text="write(item.value)" class="shrink-0 tabular-nums text-fg-secondary" />
        </CollapsibleTrigger>
        <div v-else :class="rowClass">
          <TextMorph :text="item.label" class="min-w-0 whitespace-nowrap text-fg" />
          <TextMorph :text="write(item.value)" class="shrink-0 tabular-nums text-fg-secondary" />
        </div>
        <CollapsibleContent v-if="$slots.detail" class="relative px-3.5">
          <slot name="detail" :item="item" :index="index" />
        </CollapsibleContent>
      </Collapsible>
    </li>
  </ul>
</template>
