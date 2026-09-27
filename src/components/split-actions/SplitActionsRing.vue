<script setup lang="ts">
import { computed, ref, useTemplateRef, type Component } from 'vue'
import IconMorph from '../../components/icon-morph/IconMorph.vue'
import TextMorph from '../../components/text-morph/TextMorph.vue'
import { useSplitOpen } from './useSplitOpen'

/**
 * Lab: the round button grows, where it is, into a ring round itself, the ring split into one
 * segment per action by fine gaps of the page, after Rauno Freiberg's radial menu. The ring is one
 * object in the surface tone, uncovered from the button's own edge out (a real size: its clip
 * widens, nothing scales); the segment under the pointer or the focus rises to the raised tone
 * and its name comes into words above the ring (TextMorph); the button's plus turns into its
 * close (IconMorph). Closing, the icons go first, then the ring draws back into the button.
 */
export interface RingAction {
  label: string
  icon: Component
  onSelect?: () => void
}
const props = defineProps<{ label: string; actions: RingAction[] }>()
const emit = defineEmits<{ select: [action: RingAction] }>()

const root = useTemplateRef<HTMLElement>('root')
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const { open, showing, buttons, toggle, close, onKey } = useSplitOpen(root, trigger)

// The ring: from just outside the button (a gap of the page between them) to its outer edge.
const BUTTON = 22
const INNER = 30
const OUTER = 86
const GAP = 3
const SIDE = OUTER * 2
const mid = (INNER + OUTER) / 2
const n = computed(() => props.actions.length)
// Segment i centred on the angle straight up, then clockwise.
const centreOf = (i: number) => -90 + (i * 360) / n.value
const point = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return [OUTER + r * Math.cos(a), OUTER + r * Math.sin(a)]
}
function sector(i: number) {
  const half = 180 / n.value
  const c = centreOf(i)
  // The gap is the same width at every radius: a shorter angle at the outer edge.
  const cut = (r: number) => ((GAP / 2 / r) * 180) / Math.PI
  const [a0, a1] = [c - half + cut(OUTER), c + half - cut(OUTER)]
  const [b0, b1] = [c - half + cut(INNER), c + half - cut(INNER)]
  const large = half * 2 > 180 ? 1 : 0
  const [x0, y0] = point(OUTER, a0)
  const [x1, y1] = point(OUTER, a1)
  const [x2, y2] = point(INNER, b1)
  const [x3, y3] = point(INNER, b0)
  return `M${x0} ${y0}A${OUTER} ${OUTER} 0 ${large} 1 ${x1} ${y1}L${x2} ${y2}A${INNER} ${INNER} 0 ${large} 0 ${x3} ${y3}Z`
}
const iconAt = (i: number) => {
  const [x, y] = point(mid, centreOf(i))
  return { left: `${x}px`, top: `${y}px` }
}

const hovered = ref<number>()
const caption = computed(() => (hovered.value === undefined ? '' : props.actions[hovered.value]!.label))

function choose(action: RingAction) {
  action.onSelect?.()
  emit('select', action)
  close()
}
</script>

<template>
  <div ref="root" role="group" :aria-label="label" class="relative inline-grid size-11 place-items-center align-middle">
    <!-- The ring, uncovered from the button's edge out; the gaps are the page showing through. -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute top-1/2 left-1/2 -translate-1/2 motion-reduce:transition-none"
      :style="{
        width: `${SIDE}px`,
        height: `${SIDE}px`,
        clipPath: `circle(${open && showing ? OUTER + 1 : BUTTON}px at 50% 50%)`,
        transition: `clip-path ${open && showing ? '420ms' : '260ms'} var(--ease-emphasized)`,
      }"
    >
      <svg :viewBox="`0 0 ${SIDE} ${SIDE}`" class="size-full overflow-visible">
        <path
          v-for="(action, i) in actions"
          :key="action.label"
          :d="sector(i)"
          :class="[
            'transition-[fill] duration-150',
            hovered === i ? 'fill-[color:var(--color-surface-raised)]' : 'fill-[color:var(--color-surface)]',
          ]"
        />
      </svg>
    </div>
    <!-- What the segment under the pointer does, in words above the ring. -->
    <span
      aria-hidden="true"
      class="pointer-events-none absolute left-1/2 -translate-x-1/2 text-meta whitespace-nowrap text-fg-muted"
      :style="{ bottom: `${OUTER + 30}px` }"
    >
      <TextMorph :text="showing ? caption : ''" />
    </span>
    <button
      v-for="(action, i) in actions"
      :key="action.label"
      :ref="(el) => el && (buttons[i] = el as HTMLButtonElement)"
      type="button"
      :aria-label="action.label"
      :tabindex="showing ? 0 : -1"
      :class="[
        'absolute top-1/2 left-1/2 flex size-11 -translate-1/2 cursor-pointer items-center justify-center rounded-full outline-none',
        hovered === i ? 'text-fg' : 'text-fg-secondary',
        showing
          ? 'animate-[blur-in_0.3s_var(--ease-soft)_both] motion-reduce:animate-none'
          : 'pointer-events-none opacity-0 transition-opacity duration-150',
      ]"
      :style="{
        ...iconAt(i),
        marginLeft: `${BUTTON - OUTER}px`,
        marginTop: `${BUTTON - OUTER}px`,
        animationDelay: `${200 + i * 50}ms`,
      }"
      @click="choose(action)"
      @keydown="onKey($event, i)"
      @pointerenter="hovered = i"
      @pointerleave="hovered = undefined"
      @focus="hovered = i"
      @blur="hovered = undefined"
    >
      <component :is="action.icon" aria-hidden="true" class="size-4" />
    </button>
    <button
      ref="trigger"
      type="button"
      :aria-label="label"
      :aria-expanded="showing ? 'true' : 'false'"
      class="relative flex size-11 cursor-pointer items-center justify-center rounded-full bg-surface text-fg focus-ring"
      @click="toggle($event)"
    >
      <IconMorph :icon="showing ? 'close' : 'plus'" class="size-4" />
    </button>
  </div>
</template>
