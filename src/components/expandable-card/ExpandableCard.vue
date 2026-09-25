<script setup lang="ts">
import { motion } from 'motion-v'
import { computed, nextTick, useId, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { contentOut, morphCloseTransition } from '../../utils/motion'
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
const paint = computed(() => ({
  borderRadius: `${props.radius}px`,
  boxShadow: '0 0 0 1px var(--expandable-card-edge)',
  '--expandable-card-brand': props.brand,
}))

// The box is the card's fill and edge. Changes to it fade rather than switch; the edge can
// transition because `--expandable-card-edge` is registered in tokens.css. Tailwind only sees
// complete class names, so every state is spelled out.
const boxTransition = 'text-fg transition-[background-color,--expandable-card-edge] duration-300 ease-out'
const box = [
  'bg-[color:var(--card-bg,var(--color-bg-subtle))]',
  '[--expandable-card-edge:color-mix(in_srgb,var(--expandable-card-brand,var(--color-border-strong))_60%,var(--color-border))]',
]
// At rest: a neutral box, or none at all for `ghost`.
const restBox = computed(() =>
  props.variant === 'ghost'
    ? 'bg-transparent [--expandable-card-edge:transparent]'
    : 'bg-[color:var(--card-bg,var(--color-bg-subtle))] [--expandable-card-edge:var(--card-border,var(--color-border))]',
)
const boxOnInteraction = [
  '[&:is(:hover,:focus-within)]:bg-[color:var(--card-bg,var(--color-bg-subtle))]',
  '[&:is(:hover,:focus-within)]:[--expandable-card-edge:color-mix(in_srgb,var(--expandable-card-brand,var(--color-border-strong))_60%,var(--color-border))]',
]
// A card landing back in its cell starts boxed and lets the box fade away.
const boxOnArrival = [
  'starting:bg-[color:var(--card-bg,var(--color-bg-subtle))]',
  'starting:[--expandable-card-edge:color-mix(in_srgb,var(--expandable-card-brand,var(--color-border-strong))_60%,var(--color-border))]',
]
// A `ghost` card opened without its box showing (by touch) materializes the box as it grows.
const noBoxOnArrival = 'starting:bg-transparent starting:[--expandable-card-edge:transparent]'
const siblingsIn = { duration: 0.22, ease: 'linear' } as const
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

    <motion.article
      v-if="lifted"
      :layout-id="`${id}-card`"
      :style="paint"
      data-expandable-card-open
      :class="
        cn(
          boxTransition,
          box,
          variant === 'ghost' && !boxedAtOpen && noBoxOnArrival,
          'absolute inset-x-0 top-0 z-20 flex min-h-full cursor-pointer flex-col overflow-hidden',
        )
      "
      @click="closeFromCard"
    >
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
