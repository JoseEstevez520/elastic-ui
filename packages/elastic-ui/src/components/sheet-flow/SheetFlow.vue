<script setup lang="ts">
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { boxOf, useMorphBox } from '../../composables/useMorphBox'
import { ChevronLeftIcon, XIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import { contentOut, prefersReducedMotion } from '../../utils/motion'
import { dialogMorphTriggerClass } from '../dialog-morph/dialog-morph.variants'
import TextMorph from '../text-morph/TextMorph.vue'
import { provideSheetFlowContext } from './sheet-flow.context'
import { sheetFlowBarClass, sheetFlowIconButtonClass } from './sheet-flow.variants'

/**
 * A short task in steps, in a sheet grown out of its button, after Family's trays. Pressed, the
 * button's box grows into a sheet at the bottom (useMorphBox, as Sheet), as tall as the first
 * step. Moving on, the step on show fades first, then the sheet eases to the next step's own
 * height, then that step comes into focus as a wave, its title morphing from the last on the bar:
 * a change in height says you moved on. A step taller than the screen takes nearly all of it and
 * scrolls. Back goes to the step before; the last step's `finish` (or the cross, Escape, a click
 * outside) folds the sheet back into its button. Focus, scroll lock and ARIA come from Reka UI's
 * Dialog, as Sheet's.
 */
const props = withDefaults(
  defineProps<{
    /** How wide the sheet is at most, in pixels; on a phone, the screen's width. */
    width?: number
    backLabel?: string
    closeLabel?: string
    /** Applied to the sheet's content. */
    class?: HTMLAttributes['class']
  }>(),
  { width: 440, backLabel: labelFor('back'), closeLabel: labelFor('close') },
)
const open = defineModel<boolean>('open', { default: false })
const step = defineModel<number>('step', { default: 0 })
const emit = defineEmits<{ complete: [] }>()

// The steps, as they register in the order written.
const titles = ref<{ id: symbol; title: string }[]>([])
const shown = ref(step.value)
const last = computed(() => titles.value.length - 1)
provideSheetFlowContext({
  shown,
  titles,
  next: () => (step.value < last.value ? step.value++ : finish()),
  back: () => step.value > 0 && step.value--,
  finish,
})
function finish() {
  emit('complete')
  open.value = false
}

const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const content = useTemplateRef<HTMLElement>('content')
const MARGIN = 8
const MAX = 0.9

// The sheet: at the bottom, as wide as it may be and as tall as the step on show, read at that
// width (DECISIONS, "Something measured from its content comes out too tall").
function sheetBox(height: number) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const width = Math.min(props.width, vw - MARGIN * 2)
  const h = Math.min(height, vh * MAX)
  return { top: vh - MARGIN - h, left: (vw - width) / 2, width, height: h }
}
const {
  shown: out,
  grown,
  visible,
  settled,
  returned,
  to,
  style,
  measure,
} = useMorphBox({
  open,
  from: () => boxOf(trigger.value),
  to: async () => {
    to.value = sheetBox(to.value?.height ?? 0)
    await nextTick()
    return sheetBox(content.value?.scrollHeight ?? 0)
  },
  returnFocus: () => trigger.value,
})
const surfaceStyle = computed(() =>
  style({
    borderRadius: ['8px', '16px'],
    boxShadow: ['0 0 0 1px var(--color-border-strong)', '0 0 0 1px var(--color-border), var(--shadow-overlay)'],
  }),
)
// The content keeps the sheet's width from the start, pinned to its bottom, so the box uncovers
// it; its height is its own, up to what the sheet may take.
const contentStyle = computed(() => ({
  width: `${to.value?.width ?? 0}px`,
  maxHeight: `${Math.round(window.innerHeight * MAX)}px`,
}))

// A flow is one task: once it has folded back into its button, it starts again from its first
// step. Opened, it shows the step asked for, with no step change to play.
watch(out, (isOut) => {
  if (isOut) shown.value = step.value
  else step.value = shown.value = 0
})

// Moving from step to step: the step on show leaves first, then the sheet takes the next one's
// height, and the next one comes in as a wave.
const leaving = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
onBeforeUnmount(() => clearTimeout(timer))
watch(step, (to) => {
  clearTimeout(timer)
  if (!grown.value) return void (shown.value = to)
  leaving.value = true
  timer = setTimeout(
    async () => {
      shown.value = to
      leaving.value = false
      await nextTick()
      await measure()
    },
    prefersReducedMotion() ? 0 : contentOut.duration * 1000,
  )
})

// Scrolled down, the step fades under the bar, as Sheet's content does under its cross.
const scrolled = ref(false)
</script>

<template>
  <DialogRoot :open="out" @update:open="open = $event">
    <button
      ref="trigger"
      type="button"
      aria-haspopup="dialog"
      :class="dialogMorphTriggerClass"
      style="border-radius: 8px; box-shadow: 0 0 0 1px var(--color-border-strong)"
      @click="open = true"
    >
      <span
        :class="[
          out && 'opacity-0',
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
        class="fixed z-50 overflow-hidden bg-[color:var(--dialog-bg,var(--color-surface-raised))] text-fg outline-none"
        :style="surfaceStyle"
        :aria-describedby="undefined"
        @close-auto-focus.prevent
      >
        <div ref="content" :class="cn('absolute bottom-0 left-0 flex flex-col', props.class)" :style="contentStyle">
          <div
            :class="[
              sheetFlowBarClass,
              'transition-opacity',
              visible ? 'opacity-100 delay-200 duration-300' : 'opacity-0 duration-150',
            ]"
          >
            <button
              type="button"
              :aria-label="backLabel"
              :disabled="shown === 0"
              :tabindex="shown === 0 ? -1 : 0"
              :class="[sheetFlowIconButtonClass, shown === 0 ? 'opacity-0' : 'opacity-100 duration-300']"
              @click="step > 0 && step--"
            >
              <ChevronLeftIcon aria-hidden="true" class="size-4" />
            </button>
            <DialogTitle class="min-w-0 flex-1 truncate text-label text-fg">
              <TextMorph :text="titles[shown]?.title ?? ''" />
            </DialogTitle>
            <DialogClose :aria-label="closeLabel" :class="sheetFlowIconButtonClass">
              <XIcon aria-hidden="true" class="size-4" />
            </DialogClose>
          </div>
          <!-- The step on show: it fades at once before the sheet changes height, and the next one
               comes into focus as a wave once the height is on its way. -->
          <div
            :class="[
              'min-h-0 flex-1 overscroll-contain scrollbar-subtle px-6 pt-1 pb-6 [scrollbar-gutter:stable]',
              scrolled
                ? '[mask-image:linear-gradient(to_bottom,transparent,#000_1.5rem,#000_calc(100%-1.5rem),transparent)]'
                : '[mask-image:linear-gradient(to_bottom,#000_calc(100%-1.5rem),transparent)]',
              settled ? 'overflow-y-auto' : 'overflow-hidden',
              leaving || !visible ? 'opacity-0 transition-opacity duration-[160ms] ease-linear' : 'opacity-100',
            ]"
            @scroll="scrolled = ($event.target as HTMLElement).scrollTop > 0"
          >
            <slot />
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
