<script setup lang="ts" generic="T">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import { bezier, contentOut, EASE_SOFT, morphTransition, prefersReducedMotion } from '../../utils/motion'
import Empty from '../empty/Empty.vue'
import ToggleGroup from '../toggle/ToggleGroup.vue'
import ToggleGroupItem from '../toggle/ToggleGroupItem.vue'

/** One way to narrow the grid: a module, a kind of work, a year. */
export interface GalleryFacet<T> {
  /** Its key in the `v-model` object. */
  name: string
  /** Names its group for screen readers. */
  label?: string
  /** The value an item has for it. */
  of: (item: T) => string
  /** Its values, in the order shown; read from the items when left out. */
  values?: string[]
}

/**
 * A grid of work, narrowed by one or more facets: a portfolio's projects by kind, a class's
 * practices, notes and resources by module and by kind. Each facet sits above the grid as a
 * ToggleGroup, "All" first, the raised part sliding to the value chosen.
 *
 * Narrowing it, three beats, one after another so the eye follows each (leaving comes before
 * making room): what no longer belongs fades out where it is, all at once; then what stays slides
 * to its new cell, for real, as whole objects on the morph's curve; then what comes in comes into
 * focus in its cell as one wave. Nothing fades out only to come back, and with nothing left, the
 * library's Empty says so. Items render from `items` through the default slot, as GalleryItems
 * or Cards.
 */
const props = withDefaults(
  defineProps<{
    items: T[]
    /** The facets to narrow it by. */
    facets?: GalleryFacet<T>[]
    /** Shorthand for a single facet named `category`. */
    categoryOf?: (item: T) => string
    /** With `categoryOf`, its values in order. */
    categories?: string[]
    itemKey?: (item: T) => string | number
    allLabel?: string
    /** With `categoryOf`, names its group for screen readers. */
    label?: string
    /** What Empty says when nothing matches. */
    emptyLabel?: string
    class?: HTMLAttributes['class']
    /** Applied to the grid. */
    gridClass?: HTMLAttributes['class']
  }>(),
  { allLabel: labelFor('all'), label: labelFor('categories'), emptyLabel: labelFor('nothingMatches') },
)
defineSlots<{ default?(props: { item: T; index: number }): unknown; empty?(): unknown }>()

/** The value chosen per facet, by name; missing or `''` for all. */
const filters = defineModel<Record<string, string>>({ default: () => ({}) })

const shownFacets = computed<GalleryFacet<T>[]>(() => [
  ...(props.categoryOf
    ? [{ name: 'category', label: props.label, of: props.categoryOf, values: props.categories }]
    : []),
  ...(props.facets ?? []),
])
const valuesOf = (facet: GalleryFacet<T>) => facet.values ?? [...new Set(props.items.map(facet.of))]
const keyOf = (item: T, index: number) => props.itemKey?.(item) ?? index

const matching = computed(() =>
  props.items.filter((item) =>
    shownFacets.value.every((f) => !filters.value[f.name] || f.of(item) === filters.value[f.name]),
  ),
)

const ALL = '\u0000all'
// Each group always has one pressed: choosing the pressed one again keeps it, not none.
function choose(facet: string, value: string | string[] | undefined) {
  if (typeof value === 'string') filters.value = { ...filters.value, [facet]: value === ALL ? '' : value }
}

// What the grid holds: the items shown, each with its key, and the ones on their way in hidden
// until the wave reaches them.
const rendered = shallowRef(matching.value.map((item, i) => ({ item, key: keyOf(item, i) })))
const arriving = ref(new Set<string | number>())
const elements = new Map<string | number, HTMLElement>()
const bind = (key: string | number) => (el: unknown) => {
  if (el instanceof HTMLElement) elements.set(key, el)
  else elements.delete(key)
}

let run = 0
let playing: Animation[] = []
// A new choice mid-way cancels what was playing: each item back as it is, the new turn starting from there.
const settle = () => (playing.forEach((a) => a.cancel()), (playing = []))
onBeforeUnmount(settle)
const play = (el: HTMLElement, keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
  const animation = el.animate(keyframes, options)
  playing.push(animation)
  return animation.finished.catch(() => {})
}

watch(matching, async (next) => {
  const turn = ++run
  settle()
  const nextKeys = next.map((item, i) => keyOf(item, i))
  const before = new Set(rendered.value.map((r) => r.key))
  const kept = new Set(nextKeys.filter((k) => before.has(k)))
  const place = () => (rendered.value = next.map((item, i) => ({ item, key: nextKeys[i]! })))
  if (prefersReducedMotion()) return void ((arriving.value = new Set()), place())

  // 1. What no longer belongs fades out where it is, all at once.
  const leaving = rendered.value.filter((r) => !kept.has(r.key)).map((r) => elements.get(r.key))
  await Promise.all(
    leaving.map(
      (el) =>
        el &&
        play(
          el,
          [
            { opacity: 1, scale: 1 },
            { opacity: 0, scale: 0.96 },
          ],
          {
            duration: contentOut.duration * 1000,
            easing: 'linear',
            fill: 'forwards',
          },
        ),
    ),
  )
  if (turn !== run) return

  // 2. What stays slides to its new cell (measured where it was, then where it lands).
  const first = new Map([...kept].map((k) => [k, elements.get(k)?.getBoundingClientRect()]))
  arriving.value = new Set(nextKeys.filter((k) => !kept.has(k)))
  place()
  await nextTick()
  const moves = [...kept].flatMap((k) => {
    const el = elements.get(k)
    const from = first.get(k)
    if (!el || !from) return []
    const to = el.getBoundingClientRect()
    const dx = from.left - to.left
    const dy = from.top - to.top
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return []
    return [
      play(el, [{ translate: `${dx}px ${dy}px` }, { translate: '0 0' }], {
        duration: morphTransition.duration * 1000,
        easing: bezier(morphTransition.ease),
      }),
    ]
  })
  await Promise.all(moves)
  if (turn !== run) return

  // 3. What comes in comes into focus in its cell, as one wave in reading order.
  const incoming = nextKeys.filter((k) => arriving.value.has(k))
  arriving.value = new Set()
  await nextTick()
  incoming.forEach((k, i) => {
    const el = elements.get(k)
    if (!el) return
    play(
      el,
      [
        { opacity: 0, filter: 'blur(2px)' },
        { opacity: 1, filter: 'blur(0)' },
      ],
      {
        duration: 450,
        delay: i * 60,
        easing: bezier(EASE_SOFT),
        fill: 'backwards',
      },
    )
  })
})
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <div class="flex flex-wrap gap-3">
      <ToggleGroup
        v-for="facet in shownFacets"
        :key="facet.name"
        :model-value="filters[facet.name] || ALL"
        type="single"
        size="sm"
        :aria-label="facet.label ?? facet.name"
        @update:model-value="choose(facet.name, $event)"
      >
        <ToggleGroupItem :value="ALL">{{ allLabel }}</ToggleGroupItem>
        <ToggleGroupItem v-for="value in valuesOf(facet)" :key="value" :value="value">{{ value }}</ToggleGroupItem>
      </ToggleGroup>
    </div>
    <div v-if="rendered.length" :class="cn('grid grid-cols-2 gap-4 sm:grid-cols-3', gridClass)">
      <div
        v-for="(entry, index) in rendered"
        :key="entry.key"
        :ref="bind(entry.key)"
        :class="['min-w-0', arriving.has(entry.key) && 'opacity-0']"
      >
        <slot :item="entry.item" :index="index" />
      </div>
    </div>
    <slot v-else name="empty">
      <Empty :title="emptyLabel" />
    </slot>
  </div>
</template>
