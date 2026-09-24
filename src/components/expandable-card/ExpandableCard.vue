<script setup lang="ts">
import { motion } from 'motion-v'
import { computed, useId, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { contentIn, contentOut } from '../../utils/motion'
import ExpandableCardMorph from './ExpandableCardMorph.vue'
import ExpandableCardRegion from './ExpandableCardRegion.vue'
import { useExpandableCardGroup } from './expandable-card.context'

const props = withDefaults(
  defineProps<{
    /** Unique within the group. Defaults to a generated id. */
    value?: string
    /** Any CSS color. Tints the edge on hover and while open. */
    brand?: string
    /** In pixels: Motion can only correct a numeric radius against its scale. */
    radius?: number
    class?: HTMLAttributes['class']
  }>(),
  { radius: 16 },
)

const id = props.value ?? useId()
const bodyId = `${id}-body`
const group = useExpandableCardGroup()

// Filled by the cell's texts as they unmount, read by the overlay's texts as they mount.
const textWidths = new Map<string, number>()

const lifted = computed(() => group.liftedId.value === id)
const expanded = computed(() => lifted.value && group.openId.value === id)
const dimmed = computed(() => group.activeId.value !== null && group.activeId.value !== id)

// Radius and edge live inline on the element that owns the `layoutId`, where Motion corrects
// them against its scale. A CSS border would stretch to several pixels mid-morph.
const paint = computed(() => ({
  borderRadius: `${props.radius}px`,
  boxShadow: '0 0 0 1px var(--expandable-card-edge)',
  '--expandable-card-brand': props.brand,
}))

const surface = [
  'bg-[color:var(--card-bg,var(--color-bg))] text-fg',
  '[--expandable-card-edge:var(--card-border,var(--color-border))]',
]
// Tailwind only sees complete class names, so the hover version is spelled out too.
const brandEdge =
  '[--expandable-card-edge:color-mix(in_srgb,var(--expandable-card-brand,var(--color-border-strong))_60%,var(--color-border))]'
const brandEdgeOnHover =
  'hover:[--expandable-card-edge:color-mix(in_srgb,var(--expandable-card-brand,var(--color-border-strong))_60%,var(--color-border))]'
const siblingsIn = { duration: 0.22, ease: 'linear' } as const
const head = 'relative w-full cursor-pointer p-6 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent'
const headRow = 'flex w-full items-start gap-4'
</script>

<template>
  <!-- The cell stays statically positioned so the lifted card's containing block is the group. -->
  <div :class="cn('min-w-0', props.class)">
    <motion.article
      v-if="!lifted"
      :layout-id="`${id}-card`"
      :initial="false"
      :animate="{ opacity: dimmed ? 0 : 1, transition: dimmed ? contentOut : siblingsIn }"
      :style="paint"
      :class="cn(surface, brandEdgeOnHover, 'h-full', dimmed && 'pointer-events-none')"
      @layout-animation-complete="group.onReturned(id)"
    >
      <button type="button" :aria-expanded="false" :class="head" @click="group.open(id)">
        <ExpandableCardRegion :id="id" placement="cell" :expanded="false" :text-widths="textWidths">
          <ExpandableCardMorph name="head" :class="headRow"><slot /></ExpandableCardMorph>
        </ExpandableCardRegion>
      </button>
    </motion.article>

    <!-- Holds the cell's height while the card is out of it. -->
    <div v-else aria-hidden="true" :style="{ borderRadius: `${radius}px` }" class="invisible h-full">
      <div :class="head">
        <ExpandableCardRegion :id="id" placement="placeholder" :expanded="false" :text-widths="textWidths">
          <div :class="headRow"><slot /></div>
        </ExpandableCardRegion>
      </div>
    </div>

    <motion.article
      v-if="lifted"
      :layout-id="`${id}-card`"
      :style="paint"
      :class="cn(surface, brandEdge, 'absolute inset-x-0 top-0 z-20 flex h-full flex-col overflow-hidden')"
    >
      <button type="button" :aria-expanded="true" :aria-controls="bodyId" :class="head" @click="group.close()">
        <ExpandableCardRegion :id="id" placement="overlay" :expanded="expanded" :text-widths="textWidths">
          <ExpandableCardMorph name="head" :class="headRow"><slot /></ExpandableCardMorph>
        </ExpandableCardRegion>
      </button>

      <!-- Faded rather than unmounted: the card drops out of the overlay in the same update
           the fade ends, so there is never a frame where it is mounted without its body. -->
      <motion.div
        :id="bodyId"
        layout
        :initial="{ opacity: 0 }"
        :animate="{ opacity: expanded ? 1 : 0, transition: expanded ? contentIn : contentOut }"
        class="relative flex flex-1 flex-col px-6 pb-6"
        @animation-complete="!expanded && group.onBodyHidden(id)"
      >
        <slot name="body" />
      </motion.div>
    </motion.article>
  </div>
</template>
