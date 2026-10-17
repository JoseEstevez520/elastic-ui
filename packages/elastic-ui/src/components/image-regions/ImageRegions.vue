<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { cn } from '../../utils/cn'
import type { ImageRegion } from './image-regions.types'
import { regionColor, regionIcon } from './image-regions.variants'

/**
 * A picture with places marked on it: the shelves that are empty, the parts of a scan, the rooms
 * of a plan. Each region is an outline in its tone (a pale line under the colour so it reads on a
 * busy photo) with a small glass mark at its corner. Pressing a region makes its mark grow, in
 * place, into a card of glass that says what it is, as a button becomes its panel (the mark's real
 * width and height change, its text never scales); pressing it again, Escape or anywhere else
 * folds it back. One card is open at a time; `v-model` is the key of the region open.
 *
 * Colour only says an outcome: `success`, `warning`, `danger`; `neutral` for a place that is just a
 * place. The card's content is the `region` slot, by default the name and its description.
 */
const props = defineProps<{
  /** The picture. Without it, a flat tray stands in, so the regions can still be shown. */
  src?: string
  /** What the picture shows. */
  alt: string
  /** The picture's size in pixels, the space `points` are in. */
  width: number
  height: number
  regions: ImageRegion[]
  class?: HTMLAttributes['class']
}>()

defineSlots<{
  region?: (props: { region: ImageRegion }) => unknown
}>()

const selected = defineModel<string | null>({ default: null })
const toggle = (key: string) => (selected.value = selected.value === key ? null : key)

const boxOf = (region: ImageRegion) => {
  const xs = region.points.map((p) => p[0])
  const ys = region.points.map((p) => p[1])
  return { x1: Math.min(...xs), x2: Math.max(...xs), y1: Math.min(...ys), y2: Math.max(...ys) }
}
const percent = (value: number, of: number) => `${(value / of) * 100}%`

// The mark sits at the region's top corner on the side nearer the picture's edge, so its card
// grows towards the room there is; when open it also keeps clear of the picture's bottom edge.
function placement(region: ImageRegion, open: boolean) {
  const box = boxOf(region)
  const right = (box.x1 + box.x2) / 2 > props.width / 2
  const top = percent(box.y1, props.height)
  return {
    [right ? 'right' : 'left']: percent(right ? props.width - box.x2 : box.x1, props.width),
    top: open ? `min(${top}, calc(100% - var(--image-regions-card-height, 6rem) - 0.375rem))` : top,
  }
}
const isRight = (region: ImageRegion) => {
  const box = boxOf(region)
  return (box.x1 + box.x2) / 2 > props.width / 2
}

useEventListener<KeyboardEvent>(() => document, 'keydown', (e) => {
  if (e.key === 'Escape' && selected.value) selected.value = null
})
function outside(e: Event) {
  const target = e.target as Element | null
  if (selected.value && !target?.closest('[data-image-regions]')) selected.value = null
}
useEventListener<Event>(() => document, 'pointerdown', outside)

const aspect = computed(() => ({ aspectRatio: `${props.width} / ${props.height}` }))
</script>

<template>
  <div
    data-image-regions
    :class="cn('relative overflow-hidden rounded-xl bg-surface-sunk', props.class)"
    :style="aspect"
  >
    <img v-if="src" :src="src" :alt="alt" loading="lazy" decoding="async" class="absolute inset-0 size-full object-cover" />
    <svg
      :viewBox="`0 0 ${width} ${height}`"
      class="absolute inset-0 size-full"
      :role="src ? undefined : 'img'"
      :aria-label="src ? undefined : alt"
      :aria-hidden="src ? true : undefined"
    >
      <g v-for="region in regions" :key="region.key" :style="{ '--tone': regionColor[region.tone] }">
        <polygon
          :points="region.points.map((p) => p.join(',')).join(' ')"
          fill="none"
          class="stroke-surface-raised/60"
          :stroke-width="selected === region.key ? 8 : 6"
          stroke-linejoin="round"
          pointer-events="none"
        />
        <polygon
          :points="region.points.map((p) => p.join(',')).join(' ')"
          role="button"
          tabindex="0"
          :aria-label="region.label"
          :aria-expanded="selected === region.key"
          stroke-linejoin="round"
          :stroke-width="selected === region.key ? 5 : 3"
          :class="
            cn(
              'cursor-pointer fill-[var(--tone)] stroke-[var(--tone)] outline-none transition-[fill-opacity,stroke-width] duration-200 motion-reduce:transition-none',
              '[fill-opacity:0.12] hover:[fill-opacity:0.22] focus-visible:[stroke-dasharray:6_4]',
              'data-[on=true]:[fill-opacity:0.35] data-[on=true]:hover:[fill-opacity:0.35]',
            )
          "
          :data-on="selected === region.key"
          @click="toggle(region.key)"
          @keydown.enter.prevent="toggle(region.key)"
          @keydown.space.prevent="toggle(region.key)"
        />
      </g>
    </svg>
    <div
      v-for="region in regions"
      :key="region.key"
      :role="selected === region.key ? 'region' : undefined"
      :aria-label="selected === region.key ? region.label : undefined"
      :aria-hidden="selected === region.key ? undefined : true"
      :data-open="selected === region.key"
      :class="
        cn(
          'glass-strong absolute m-1.5 overflow-hidden rounded-lg shadow-overlay',
          'transition-[width,height,top] ease-emphasized motion-reduce:transition-none',
          selected === region.key ? 'z-10 duration-[350ms]' : 'z-0 cursor-pointer duration-[250ms]',
        )
      "
      :style="{
        ...placement(region, selected === region.key),
        width: selected === region.key ? 'min(var(--image-regions-card-width, 12.5rem), calc(100% - 0.75rem))' : '1.75rem',
        height: selected === region.key ? 'var(--image-regions-card-height, 6rem)' : '1.75rem',
        color: regionColor[region.tone],
      }"
      @click="toggle(region.key)"
    >
      <!-- The mark: centred in its own corner square, it stays put as the card grows from it. -->
      <span :class="cn('absolute top-0 flex size-7 items-center justify-center', isRight(region) ? 'right-0' : 'left-0')">
        <component :is="region.icon ?? regionIcon[region.tone]" class="size-4" aria-hidden="true" />
      </span>
      <div
        v-if="selected === region.key"
        class="absolute inset-0 animate-blur-in px-3 text-fg motion-reduce:animate-none"
        style="animation-delay: 0.12s"
      >
        <slot name="region" :region="region">
          <p :class="cn('flex h-7 items-center font-medium', isRight(region) ? 'pr-6' : 'pl-6')">{{ region.label }}</p>
          <p v-if="region.description" class="text-ui text-fg-secondary">{{ region.description }}</p>
        </slot>
      </div>
    </div>
  </div>
</template>
