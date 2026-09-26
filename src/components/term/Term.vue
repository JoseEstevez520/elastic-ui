<script setup lang="ts">
import { computed, nextTick, ref, useSlots, useTemplateRef, watch } from 'vue'
import Popover from '../popover/Popover.vue'
import PopoverContent from '../popover/PopoverContent.vue'
import PopoverTrigger from '../popover/PopoverTrigger.vue'
import { useEventListener } from '../../composables/useEventListener'
import { boxOf, useMorphBox } from '../../composables/useMorphBox'
import { XIcon } from '../../icons/internal'
import { labelFor } from '../../utils/labels'

/**
 * A word that explains itself where it is read, after Curio, made of the library's parts.
 * Two depths:
 *
 *   A glance: pressed, the word stays lit with SelectionMenu's band, and a small card appears
 *   under it (the library's Popover: it follows the word as the page scrolls, flips above it near
 *   the bottom) with the meaning in a sentence and "See more".
 *
 *   The whole of it: "See more" grows that same card into a large one in the middle of the page,
 *   a real size (useMorphBox), the page dimmed behind as under a dialog, never shadowed. Closing
 *   it (its cross, Escape, the dimmed page) folds it back into the glance, still open.
 */
withDefaults(
  defineProps<{
    /** The heading of its glance and its card: the term as it is named. */
    title: string
    moreLabel?: string
    closeLabel?: string
  }>(),
  { moreLabel: labelFor('seeMore'), closeLabel: labelFor('close') },
)
const slots = useSlots()

const open = ref(false)
const expanded = ref(false)
const glance = useTemplateRef<HTMLElement>('glance')
const content = useTemplateRef<HTMLElement>('content')
const seeMore = useTemplateRef<HTMLButtonElement>('seeMore')
const closeButton = useTemplateRef<HTMLButtonElement>('closeButton')

// The large card: in the middle of the screen, as tall as its content once laid out at its width.
const cardWidth = ref(560)
const { shown, grown, visible, settled, style } = useMorphBox({
  open: expanded,
  from: () => boxOf(glance.value?.closest('[data-state]')),
  to: async () => {
    cardWidth.value = Math.min(560, innerWidth - 32)
    await nextTick()
    const height = Math.min(content.value?.scrollHeight ?? 320, innerHeight * 0.8)
    return { top: (innerHeight - height) / 2, left: (innerWidth - cardWidth.value) / 2, width: cardWidth.value, height }
  },
  returnFocus: () => seeMore.value,
})
const cardStyle = computed(() => style({ borderRadius: ['var(--radius-lg)', '20px'] }))
watch(settled, (isSettled) => isSettled && closeButton.value?.focus({ preventScroll: true }))
// The glance closing takes the whole of it with it.
watch(open, (isOpen) => !isOpen && (expanded.value = false))

// Escape while it is the large card folds it back into the glance, rather than closing both.
useEventListener<KeyboardEvent>(
  () => document,
  'keydown',
  (e) => {
    if (e.key === 'Escape' && expanded.value) {
      e.stopPropagation()
      expanded.value = false
    }
  },
  { capture: true },
)
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <button
        type="button"
        :class="[
          'inline cursor-pointer rounded-[var(--radius-sm)] -mx-[0.15em] px-[0.15em] text-inherit transition-colors duration-150 focus-ring',
          open
            ? 'bg-[color:var(--selection-bg,color-mix(in_srgb,var(--color-accent)_28%,transparent))] text-fg'
            : 'underline decoration-dotted decoration-[color:var(--color-fg-faint)] decoration-1 underline-offset-[0.25em] hover:bg-[color:color-mix(in_srgb,var(--color-accent)_14%,transparent)] hover:no-underline',
        ]"
      >
        <slot />
      </button>
    </PopoverTrigger>
    <!-- The glance: under the word, following it; hidden while it is the large card. -->
    <PopoverContent
      side="bottom"
      align="start"
      :side-offset="6"
      :class="['w-72 p-4', shown && 'invisible']"
      @interact-outside="shown && $event.preventDefault()"
    >
      <div ref="glance" class="text-sm leading-relaxed">
        <p class="font-medium text-fg">{{ title }}</p>
        <div class="mt-1 text-fg-secondary"><slot name="definition" /></div>
        <button
          v-if="slots.more"
          ref="seeMore"
          type="button"
          class="mt-2 cursor-pointer text-sm font-medium text-[color:var(--color-accent)] hover:underline focus-ring"
          @click="expanded = true"
        >
          {{ moreLabel }}
        </button>
      </div>
    </PopoverContent>
  </Popover>

  <Teleport to="body">
    <template v-if="shown">
      <!-- The page dimmed behind, as under a dialog: never a shadow. Above the glance's own layer,
           which stays (hidden) to be folded back into and would otherwise take the clicks. -->
      <div
        :class="[
          'fixed inset-0 z-[60] bg-[color:var(--dialog-overlay,rgb(0_0_0/0.4))] transition-opacity duration-300',
          grown ? 'opacity-100' : 'opacity-0',
        ]"
        @click="expanded = false"
      />
      <div
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        class="fixed z-[60] overflow-hidden border border-[color:var(--popover-border,var(--color-border))] bg-[color:var(--popover-bg,var(--color-bg))]"
        :style="cardStyle"
      >
        <!-- The content at the card's width from the start, uncovered as the card grows. -->
        <div
          ref="content"
          :class="[
            'absolute top-0 left-0 max-h-[80vh] p-6 [scrollbar-gutter:stable] scrollbar-subtle',
            settled ? 'overflow-y-auto' : 'overflow-hidden',
            visible ? 'stagger-children [--stagger-delay:0.24s]' : 'opacity-0 transition-opacity duration-150',
          ]"
          :style="{ width: `${cardWidth}px` }"
        >
          <h2 class="pr-8 text-xl font-semibold tracking-tight text-fg">{{ title }}</h2>
          <div class="mt-2 leading-relaxed text-fg-secondary"><slot name="definition" /></div>
          <div class="mt-4 flex flex-col gap-3 leading-relaxed text-fg-secondary"><slot name="more" /></div>
        </div>
        <button
          ref="closeButton"
          type="button"
          :aria-label="closeLabel"
          :class="[
            'absolute top-4 right-4 flex size-8 cursor-pointer items-center justify-center rounded-full text-fg-muted transition-[color,opacity] hover:text-fg focus-ring',
            visible ? 'opacity-100 delay-200 duration-300' : 'opacity-0 duration-150',
          ]"
          @click="expanded = false"
        >
          <XIcon aria-hidden="true" class="size-4" />
        </button>
      </div>
    </template>
  </Teleport>
</template>
