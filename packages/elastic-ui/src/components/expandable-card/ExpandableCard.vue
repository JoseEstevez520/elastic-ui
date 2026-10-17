<script setup lang="ts">
import { motion } from 'motion-v'
import { computed, nextTick, useId, useSlots, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { contentOut, EASE_SOFT, morphCloseTransition } from '../../utils/motion'
import ExpandableCardMorph from './ExpandableCardMorph.vue'
import ExpandableCardRegion from './ExpandableCardRegion.vue'
import { useExpandableCardGroup } from './expandable-card.context'

const props = withDefaults(
  defineProps<{
    /** Unique within the group. Defaults to a generated id. */
    value?: string
    /**
     * `default`: a box (fill and edge) at all times.
     * `ghost`: only the content at rest; the box appears on hover, keyboard focus and when open.
     */
    variant?: 'default' | 'ghost'
    /** Any CSS color. Tints the edge on hover and while open. */
    brand?: string
    /** In pixels: Motion can only correct a numeric radius against its scale. */
    radius?: number
    class?: HTMLAttributes['class']
  }>(),
  { variant: 'default', radius: 16 },
)

const id = props.value ?? useId()
const bodyId = `${id}-body`
const group = useExpandableCardGroup()

// Filled by the cell's texts as they unmount, read by the overlay's texts as they mount.
const textWidths = new Map<string, number>()

const lifted = computed(() => group.liftedId.value === id)
const expanded = computed(() => lifted.value && group.openId.value === id)
const dimmed = computed(() => group.activeId.value !== null && group.activeId.value !== id)

// The button that had focus unmounts when the card lifts or lands, so focus follows the card:
// into the open copy when it opens, and back to the cell when it closes from inside. A close
// by clicking elsewhere leaves focus where that click put it.
// Whether the cell already showed its box when it was opened, so the open card doesn't flash.
let boxedAtOpen = false
function openFromCell(event: MouseEvent) {
  boxedAtOpen = !!(event.currentTarget as HTMLElement).closest('article')?.matches(':hover, :focus-within')
  group.open(id)
}

// A click anywhere on the open card closes it, except on something interactive inside the body
// or at the end of a text selection.
function closeFromCard(event: MouseEvent) {
  const target = event.target as Element
  if (target.closest('a, button, input, select, textarea, label, [role="button"]')) return
  if (window.getSelection()?.toString()) return
  group.close()
}

const cellButton = useTemplateRef<HTMLButtonElement>('cellButton')
const openButton = useTemplateRef<HTMLButtonElement>('openButton')
watch(lifted, async (isLifted) => {
  const hadFocus = !isLifted && openButton.value?.closest('article')?.contains(document.activeElement)
  await nextTick()
  if (isLifted) openButton.value?.focus({ preventScroll: true })
  else if (hadFocus) cellButton.value?.focus({ preventScroll: true })
})

// Radius and edge live inline on the element that owns the `layoutId`, where Motion corrects
// them against its scale. A CSS border would stretch to several pixels mid-morph.
// A card with a backdrop draws no edge: its colour is in the backdrop, and depth comes from tones.
const slots = useSlots()
const paint = computed(() => ({
  borderRadius: `${props.radius}px`,
  boxShadow: slots.backdrop ? undefined : '0 0 0 1px var(--expandable-card-edge)',
  '--expandable-card-brand': props.brand,
}))

// The box is the card's fill and edge. Changes to it fade rather than switch; the edge can
// transition because `--expandable-card-edge` is registered in tokens.css. Tailwind only sees
// complete class names, so every state is spelled out.
//
// Depth from tones (DECISIONS, "How objects are drawn"): at rest the card stands a tone off the
// page with no edge; hovered or open it rises to the raised tone, and only its brand colour, when
// it has one, draws an edge round it.
const boxTransition = 'text-fg transition-[background-color,--expandable-card-edge] duration-300 ease-out'
const box = [
  'bg-[color:var(--card-bg-raised,var(--color-surface-raised))]',
  '[--expandable-card-edge:color-mix(in_srgb,var(--expandable-card-brand,var(--color-border))_60%,transparent)]',
]
// At rest: a tone off the page, or no box at all for `ghost`.
const restBox = computed(() =>
  props.variant === 'ghost'
    ? 'bg-transparent [--expandable-card-edge:transparent]'
    : 'bg-[color:var(--card-bg,var(--color-surface))] [--expandable-card-edge:transparent]',
)
const boxOnInteraction = [
  '[&:is(:hover,:focus-within)]:bg-[color:var(--card-bg-raised,var(--color-surface-raised))]',
  '[&:is(:hover,:focus-within)]:[--expandable-card-edge:color-mix(in_srgb,var(--expandable-card-brand,transparent)_60%,transparent)]',
]
// A card landing back in its cell starts raised and settles to its tone.
const boxOnArrival = [
  'starting:bg-[color:var(--card-bg-raised,var(--color-surface-raised))]',
  'starting:[--expandable-card-edge:color-mix(in_srgb,var(--expandable-card-brand,var(--color-border))_60%,transparent)]',
]
// A `ghost` card opened without its box showing (by touch) materializes the box as it grows.
const noBoxOnArrival = 'starting:bg-transparent starting:[--expandable-card-edge:transparent]'
const siblingsIn = { duration: 0.22, ease: 'linear' } as const
// Slower than the body: a colour washing in, not text switching on.
const backdropIn = { duration: 0.6, delay: 0.25, ease: EASE_SOFT } as const
// Over colour, text is `fg` or `fg-secondary` only (USAGE, "Colour"): the greys below them are
// lost on it, so inside a card with a backdrop they read as the secondary grey.
const onColour = '[--color-fg-muted:var(--color-fg-secondary)] [--color-fg-faint:var(--color-fg-secondary)]'
// The colour is held back where the text is, the head and the body's first lines, and comes in
// full towards the bottom and the edges: where colour hurts reading, the colour gives way.
const backdropFade = 'linear-gradient(to bottom, rgb(0 0 0 / 0.3), rgb(0 0 0 / 0.55) 45%, #000 100%)'
const head = 'relative block w-full cursor-pointer text-left focus-ring-inset'
// 16px of padding on phones, the margin Material and Apple's guidelines use on compact widths.
// Parts may wrap, so a `basis-full` part (a subtitle) gets a line of its own at full width.
const headRow = 'flex w-full flex-wrap items-start gap-x-3 gap-y-1 p-4 sm:gap-x-4 sm:p-6'
</script>

<template>
  <!-- The cell stays statically positioned so the lifted card's containing block is the group. -->
  <div :class="cn('min-w-0', props.class)">
    <motion.article
      v-if="!lifted"
      :layout-id="`${id}-card`"
      :initial="false"
      :animate="{ opacity: dimmed ? 0 : 1, transition: dimmed ? contentOut : siblingsIn }"
      :transition="{ layout: morphCloseTransition }"
      :style="paint"
      :class="
        cn(
          boxTransition,
          restBox,
          'h-full overflow-hidden',
          boxOnInteraction,
          group.activeId.value === id && boxOnArrival,
          dimmed && 'pointer-events-none',
        )
      "
      @layout-animation-complete="group.onReturned(id)"
    >
      <button ref="cellButton" type="button" :aria-expanded="false" :class="head" @click="openFromCell">
        <ExpandableCardRegion :id="id" placement="cell" :expanded="false" :text-widths="textWidths">
          <slot name="media" />
          <ExpandableCardMorph name="head" :class="headRow"><slot /></ExpandableCardMorph>
        </ExpandableCardRegion>
      </button>
    </motion.article>

    <!-- Holds the cell's height while the card is out of it. -->
    <div v-else aria-hidden="true" :style="{ borderRadius: `${radius}px` }" class="invisible h-full">
      <div :class="head">
        <ExpandableCardRegion :id="id" placement="placeholder" :expanded="false" :text-widths="textWidths">
          <slot name="media" />
          <div :class="headRow"><slot /></div>
        </ExpandableCardRegion>
      </div>
    </div>

    <!-- It only morphs as it lifts out of its cell and lands back (`layout-dependency`): a change
         of its content while open just takes its room, rather than Motion scaling the card (and
         its text) to the new height. -->
    <motion.article
      v-if="lifted"
      :layout-id="`${id}-card`"
      :layout-dependency="lifted"
      :style="paint"
      data-expandable-card-open
      :class="
        cn(
          boxTransition,
          box,
          variant === 'ghost' && !boxedAtOpen && noBoxOnArrival,
          'absolute inset-x-0 top-0 z-20 flex min-h-[var(--expandable-card-cover,100%)] cursor-pointer flex-col overflow-hidden',
          $slots.backdrop && onColour,
        )
      "
      @click="closeFromCard"
    >
      <!-- What the project brings behind its open card (a Glow in its colours): it comes in as the
           card lands, with the body, and leaves at once before the card folds back. -->
      <motion.div
        v-if="$slots.backdrop"
        aria-hidden="true"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: expanded ? 1 : 0, transition: expanded ? backdropIn : contentOut }"
        class="pointer-events-none absolute inset-0"
        :style="{ maskImage: backdropFade }"
      >
        <slot name="backdrop" />
      </motion.div>
      <button
        ref="openButton"
        type="button"
        :aria-expanded="true"
        :aria-controls="bodyId"
        :class="head"
        @click.stop="group.close()"
      >
        <ExpandableCardRegion :id="id" placement="overlay" :expanded="expanded" :text-widths="textWidths">
          <slot name="media" />
          <ExpandableCardMorph name="head" :class="headRow"><slot /></ExpandableCardMorph>
        </ExpandableCardRegion>
      </button>

      <!-- The body comes into focus as one wave once the card has nearly arrived, like every
           content in the library. Leaving, it is faded rather than unmounted: the card drops out
           of the overlay in the same update the fade ends, so there is never a frame where it is
           mounted without its body. -->
      <motion.div
        :id="bodyId"
        layout
        :layout-dependency="lifted"
        :initial="false"
        :animate="{ opacity: expanded ? 1 : 0, transition: expanded ? { duration: 0 } : contentOut }"
        class="relative flex flex-1 flex-col px-4 pb-4 sm:px-6 sm:pb-6"
        @animation-complete="!expanded && group.onBodyHidden(id)"
      >
        <div class="flex flex-1 flex-col stagger-children [--stagger-delay:0.15s]">
          <slot name="body" />
        </div>
      </motion.div>
    </motion.article>
  </div>
</template>
