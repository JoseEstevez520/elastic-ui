<script setup lang="ts">
import { computed, nextTick, ref, useSlots, useTemplateRef, watch } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { useMorphBox, type Box } from '../../composables/useMorphBox'

/**
 * Lab: a word in a text that opens to what it means, in its place, after Curio. At rest a faint
 * dotted line under it says there is more; pointed at, it lights up with SelectionMenu's band.
 * Pressed, that band grows into a card right under the word, a real size (useMorphBox), the word
 * staying lit above it and readable; "More" grows the same card again into the whole of it, rather
 * than opening a panel of its own. Escape or a click elsewhere fold it back into the word.
 */
const props = defineProps<{
  /** The card's heading; the word itself by default. */
  title?: string
}>()
const slots = useSlots()

const open = ref(false)
const more = ref(false)
const word = useTemplateRef<HTMLElement>('word')
const content = useTemplateRef<HTMLElement>('content')
const card = useTemplateRef<HTMLElement>('card')

// Boxes in the page's own coordinates, so the card scrolls with the text it belongs to.
const onPage = (r: DOMRect): Box => ({ top: r.top + scrollY, left: r.left + scrollX, width: r.width, height: r.height })
const GAP = 6
const MARGIN = 12
const width = computed(() => (more.value ? 420 : 300))

// The card: under the word, its left edge on the word's, kept inside the screen; above the word if
// there is not room below. As tall as its content, read once the content has the card's width.
async function place(): Promise<Box> {
  const w = word.value!.getClientRects()[0] ?? word.value!.getBoundingClientRect()
  const cardWidth = Math.min(width.value, innerWidth - MARGIN * 2)
  const left = Math.min(Math.max(MARGIN, w.left), innerWidth - MARGIN - cardWidth)
  contentWidth.value = cardWidth
  await nextTick()
  const height = Math.min(content.value?.scrollHeight ?? 120, innerHeight * 0.7)
  const below = w.bottom + GAP + height <= innerHeight - MARGIN || w.top - GAP - height < MARGIN
  const top = below ? w.bottom + GAP : w.top - GAP - height
  return { top: top + scrollY, left: left + scrollX, width: cardWidth, height }
}
const contentWidth = ref(300)

const { shown, visible, settled, style, measure } = useMorphBox({
  open,
  from: () => {
    const r = word.value?.getClientRects()[0]
    return r && onPage(r)
  },
  to: place,
  returnFocus: () => word.value,
})
const cardStyle = computed(() =>
  style({
    borderRadius: ['4px', '14px'],
    backgroundColor: ['color-mix(in srgb, var(--color-accent) 28%, transparent)', 'var(--color-surface-raised)'],
  }),
)

// "More": the same card grows again, from where it is to its whole size.
watch(more, async () => {
  if (open.value) await measure()
})
watch(open, (isOpen) => !isOpen && (more.value = false))

useEventListener<KeyboardEvent>(
  () => document,
  'keydown',
  (e) => e.key === 'Escape' && open.value && (open.value = false),
)
useEventListener<PointerEvent>(
  () => document,
  'pointerdown',
  (e) => {
    if (!open.value || !(e.target instanceof Node)) return
    if (!card.value?.contains(e.target) && !word.value?.contains(e.target)) open.value = false
  },
)
</script>

<template>
  <button
    ref="word"
    type="button"
    :aria-expanded="open ? 'true' : 'false'"
    :class="[
      'inline cursor-pointer rounded-[4px] px-0.5 -mx-0.5 text-inherit transition-colors duration-150 focus-ring',
      // A faint dotted line says there is more; lit, the band takes its place.
      open
        ? 'bg-[color:color-mix(in_srgb,var(--color-accent)_28%,transparent)]'
        : 'underline decoration-dotted decoration-[color:var(--color-fg-faint)] decoration-1 underline-offset-[0.25em] hover:bg-[color:color-mix(in_srgb,var(--color-accent)_16%,transparent)]',
    ]"
    @click="open = !open"
  >
    <slot />
  </button>
  <Teleport to="body">
    <div
      v-if="shown"
      ref="card"
      role="dialog"
      :aria-label="title"
      class="absolute z-50 overflow-hidden shadow-[0_0_0_1px_var(--color-border-strong),0_6px_20px_-8px_light-dark(rgb(0_0_0/0.08),rgb(0_0_0/0.35))]"
      :style="cardStyle"
    >
      <!-- The content at the card's width from the start, uncovered as the card grows. -->
      <div
        ref="content"
        :class="[
          'absolute top-0 left-0 p-4 text-sm leading-relaxed text-fg-secondary',
          settled ? 'overflow-y-auto' : 'overflow-hidden',
          visible ? 'stagger-children [--stagger-delay:0.18s]' : 'opacity-0 transition-opacity duration-150',
        ]"
        :style="{ width: `${contentWidth}px`, maxHeight: '70vh' }"
      >
        <p class="font-medium text-fg">{{ title }}</p>
        <div class="mt-1.5"><slot name="definition" /></div>
        <div v-if="more" class="mt-3"><slot name="more" /></div>
        <button
          v-if="slots.more && !more"
          type="button"
          class="mt-3 cursor-pointer text-sm font-medium text-[color:var(--color-accent)] hover:underline focus-ring"
          @click="more = true"
        >
          More
        </button>
      </div>
    </div>
  </Teleport>
</template>
