<script setup lang="ts">
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogRoot } from 'reka-ui'
import { computed, nextTick, ref, useTemplateRef, type HTMLAttributes } from 'vue'
import { boxOf, useMorphBox } from '../../composables/useMorphBox'
import { XIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import { dialogMorphTriggerClass } from '../dialog-morph/dialog-morph.variants'
import { sheetContentVariants } from './sheet.variants'

/**
 * A button that becomes a panel along an edge of the screen. The button's own box grows into the
 * sheet, as ChatMorph's orb grows into its box: its edges travel out to the sheet's, taking its
 * radius on the way, while the content, already in its place, is uncovered and comes into focus.
 * Closing, the content fades first, then the box folds back into the button, which gets its label
 * and the focus back. For what goes alongside the page rather than over it: settings, a cart, the
 * details of a row. Its title goes in with SheetTitle; a cross in its corner, Escape and a click
 * outside close it. Focus trap, scroll lock and ARIA come from Reka UI's Dialog.
 */
const props = withDefaults(
  defineProps<{
    side?: 'right' | 'left' | 'bottom'
    /** At a side, how wide it is at most, in pixels. */
    width?: number
    closeLabel?: string
    /** Applied to the sheet's content. */
    class?: HTMLAttributes['class']
  }>(),
  { side: 'right', width: 384, closeLabel: labelFor('close') },
)

const open = defineModel<boolean>('open', { default: false })
const close = () => (open.value = false)

// Scrolled down: the content then fades under the cross, as ChatMorph's does.
const scrolled = ref(false)

const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const content = useTemplateRef<HTMLElement>('content')

const MARGIN = 8
// Its life, from the button's box to the sheet's and back (useMorphBox). The sheet: at a side as
// tall as the screen; at the bottom as wide, and as tall as its content, read once the content has
// the sheet's width to wrap in.
const { shown, grown, visible, settled, returned, to, style } = useMorphBox({
  open,
  from: () => boxOf(trigger.value),
  to: async () => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    if (props.side !== 'bottom') {
      const width = Math.min(props.width, vw - MARGIN * 2)
      return {
        top: MARGIN,
        left: props.side === 'right' ? vw - MARGIN - width : MARGIN,
        width,
        height: vh - MARGIN * 2,
      }
    }
    to.value = { top: vh - MARGIN, left: MARGIN, width: vw - MARGIN * 2, height: 0 }
    await nextTick()
    const height = Math.min(content.value?.scrollHeight ?? vh / 2, vh * 0.85)
    return { top: vh - MARGIN - height, left: MARGIN, width: vw - MARGIN * 2, height }
  },
  returnFocus: () => trigger.value,
})
const surfaceStyle = computed(() =>
  style({
    borderRadius: ['8px', '16px'],
    boxShadow: ['0 0 0 1px var(--color-border-strong)', '0 0 0 1px var(--color-border), var(--shadow-overlay)'],
  }),
)

// The content keeps the sheet's size from the start, pinned to the edge the sheet grows to, so
// the box uncovers it rather than squeezing it.
const contentStyle = computed(() => ({
  width: `${to.value?.width ?? 0}px`,
  height: props.side === 'bottom' ? undefined : `${to.value?.height ?? 0}px`,
}))
</script>

<template>
  <DialogRoot :open="shown" @update:open="open = $event">
    <button
      ref="trigger"
      type="button"
      aria-haspopup="dialog"
      :class="dialogMorphTriggerClass"
      style="border-radius: 8px; box-shadow: 0 0 0 1px var(--color-border-strong)"
      @click="open = true"
    >
      <!-- Out as the sheet, the button's box has left: its label waits, and comes back into focus
           as the box lands on it. -->
      <span
        :class="[
          shown && 'opacity-0',
          returned && 'animate-[blur-in_0.3s_var(--ease-soft)_both] motion-reduce:animate-none',
        ]"
      >
        <slot name="trigger" />
      </span>
    </button>

    <DialogPortal>
      <DialogOverlay
        :class="[
          'fixed inset-0 z-50 bg-[color:var(--dialog-overlay,rgb(0_0_0/0.4))] transition-opacity duration-300 ease-linear',
          grown ? 'opacity-100' : 'opacity-0',
        ]"
      />
      <DialogContent
        class="fixed z-50 overflow-hidden bg-[color:var(--dialog-bg,var(--color-bg))] text-fg outline-none"
        :style="surfaceStyle"
        @close-auto-focus.prevent
      >
        <div ref="content" :class="cn(sheetContentVariants({ side }), props.class)" :style="contentStyle">
          <!-- The content comes into focus as one wave from halfway through the box's journey, and
               fades at once before it folds back. It fades at the bottom within its padding and,
               once scrolled, under the cross along a soft edge, so at rest nothing is faded. -->
          <div
            :class="[
              'min-h-0 flex-1 overscroll-contain scrollbar-subtle p-6 pt-5',
              scrolled
                ? '[mask-image:linear-gradient(to_bottom,transparent,rgb(0_0_0/0.15)_1rem,rgb(0_0_0/0.6)_2rem,#000_3rem,#000_calc(100%-1.5rem),transparent)]'
                : '[mask-image:linear-gradient(to_bottom,#000_calc(100%-1.5rem),transparent)]',
              // The scrollbar's room is kept from the start, so the content does not narrow as it lands.
              '[scrollbar-gutter:stable]',
              settled ? 'overflow-y-auto' : 'overflow-hidden',
              visible
                ? 'stagger-children [--stagger-delay:0.25s]'
                : 'opacity-0 transition-opacity duration-[160ms] ease-linear',
            ]"
            @scroll="scrolled = ($event.target as HTMLElement).scrollTop > 0"
          >
            <slot :close="close" />
          </div>
          <DialogClose
            :aria-label="closeLabel"
            :class="[
              'absolute top-3.5 right-3.5 flex size-8 cursor-pointer items-center justify-center rounded-full text-fg-muted',
              'transition-[color,opacity] hover:text-fg focus-ring',
              visible ? 'opacity-100 delay-200 duration-300' : 'opacity-0 duration-150',
            ]"
          >
            <XIcon aria-hidden="true" class="size-4" />
          </DialogClose>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
