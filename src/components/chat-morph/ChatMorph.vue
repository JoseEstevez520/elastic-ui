<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, useTemplateRef, watch, type Component, type HTMLAttributes } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { XIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import Aurora, { type AuroraActivity } from '../aurora/Aurora.vue'
import { chatMorphTriggerState, chatMorphPanelVariants, chatMorphSurfaceVariants, chatMorphTriggerClass } from './chat-morph.variants'

/**
 * An orb that becomes a chat box of its own. The button is a small circle of drifting aurora, no
 * icon needed, and opening only lets it grow: the circle widens into the box with its colours, and
 * folds back into them. Put a ChatThread and a ChatComposer inside.
 *
 * Floating by default, held at the bottom right of the screen and opening upwards; inline, it
 * grows from wherever it sits. Closing (Escape, the cross, a click elsewhere) keeps the
 * conversation: the box only folds away.
 */
const props = withDefaults(
  defineProps<{
    /** The button's accessible name. */
    label?: string
    /** The box's accessible name. */
    title?: string
    /** Drawn on the orb, if it should carry one. */
    icon?: Component
    /** Held at the bottom right of the screen. */
    floating?: boolean
    /** The conversation has started: the aurora settles to a tint. */
    settled?: boolean
    /** What the answer is doing, for the aurora to follow: thinking, answering, or at rest. */
    activity?: AuroraActivity
    /** Applied to the box. */
    class?: HTMLAttributes['class']
  }>(),
  { label: 'Ask AI', title: 'Assistant', floating: true, settled: false, activity: 'rest' },
)

// Over the aurora, the composer and your messages turn to glass: a white veil that lets the
// colour through (never a dark fill, which reads as a hole in it), lifted by a barely-there
// shadow. Set through the chat's tokens, so a project can still override them.
const GLASS = {
  '--chat-composer-bg': 'light-dark(rgb(255 255 255 / 0.55), rgb(255 255 255 / 0.08))',
  '--chat-bubble': 'light-dark(rgb(255 255 255 / 0.55), rgb(255 255 255 / 0.08))',
  '--chat-composer-shadow': 'drop-shadow(0 2px 6px rgb(0 0 0 / 0.04))',
  '--chat-bubble-shadow': '0 2px 6px rgb(0 0 0 / 0.03)',
  '--chat-bubble-blur': '16px',
}

const open = defineModel<boolean>('open', { default: false })
const close = () => (open.value = false)

// It stays above its neighbours until it has folded all the way back.
const FOLD = 300
const folding = ref(false)
let foldTimer: ReturnType<typeof setTimeout> | undefined
watch(open, (isOpen) => {
  clearTimeout(foldTimer)
  folding.value = !isOpen
  if (!isOpen) foldTimer = setTimeout(() => (folding.value = false), FOLD)
})
onBeforeUnmount(() => clearTimeout(foldTimer))

const root = useTemplateRef<HTMLElement>('root')
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const panel = useTemplateRef<HTMLElement>('panel')
const panelId = useId()
const titleId = useId()

// The surface animates between two measured boxes; `auto` cannot be transitioned. Until the first
// measurement (and in server rendering) it simply covers the pill.
const triggerSize = ref<{ width: number; height: number }>()
const panelSize = ref<{ width: number; height: number }>()
let observer: ResizeObserver | undefined
onMounted(() => {
  const measure = () => {
    if (trigger.value) triggerSize.value = { width: trigger.value.offsetWidth, height: trigger.value.offsetHeight }
    if (panel.value) panelSize.value = { width: panel.value.offsetWidth, height: panel.value.offsetHeight }
  }
  measure()
  observer = new ResizeObserver(measure)
  for (const el of [trigger.value, panel.value]) if (el) observer.observe(el)
})
onBeforeUnmount(() => observer?.disconnect())

const surfaceStyle = computed(() => {
  const size = open.value ? panelSize.value : triggerSize.value
  return size ? { width: `${size.width}px`, height: `${size.height}px` } : { inset: 0 }
})

useEventListener<KeyboardEvent>(() => document, 'keydown', (event) => {
  if (open.value && event.key === 'Escape') close()
})
useEventListener<PointerEvent>(() => document, 'pointerdown', (event) => {
  if (open.value && event.target instanceof Node && !root.value?.contains(event.target)) close()
})

// Opening puts you in the composer, ready to write; closing from inside gives focus back to the pill.
watch(open, async (isOpen) => {
  const hadFocus = panel.value?.contains(document.activeElement)
  await nextTick()
  if (isOpen) (panel.value?.querySelector<HTMLElement>('textarea') ?? panel.value)?.focus({ preventScroll: true })
  else if (hadFocus) trigger.value?.focus({ preventScroll: true })
})
</script>

<template>
  <div
    ref="root"
    :class="[
      floating ? 'fixed right-6 bottom-6' : 'relative inline-block align-top',
      (open || folding || floating) && 'z-50',
    ]"
  >
    <div :class="chatMorphSurfaceVariants({ floating, open })" :style="surfaceStyle">
      <!-- Behind both the button and the box, clipped by the surface, so it grows with it. -->
      <Aurora :settled="settled" :activity="activity" class="absolute inset-0" />
      <div
        :id="panelId"
        ref="panel"
        role="dialog"
        :aria-labelledby="titleId"
        tabindex="-1"
        :inert="!open"
        :class="cn(chatMorphPanelVariants({ floating, open }), props.class)"
      >
        <div class="flex min-h-0 flex-1 flex-col">
          <!-- No header: the box is the conversation, with only a way out in its corner. -->
          <h2 :id="titleId" class="sr-only">{{ title }}</h2>
          <button
            type="button"
            aria-label="Close"
            class="absolute top-3 right-3 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full text-fg-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
            @click="close"
          >
            <XIcon class="size-4" />
          </button>
          <!-- The conversation ends below the cross's row, never under it, and fades out gently, on an
               eased curve, as it reaches that edge. -->
          <div :style="GLASS" class="mt-12 flex min-h-0 flex-1 flex-col [mask-image:linear-gradient(to_bottom,transparent,rgb(0_0_0/0.03)_0.5rem,rgb(0_0_0/0.15)_1rem,rgb(0_0_0/0.35)_1.5rem,rgb(0_0_0/0.6)_2rem,rgb(0_0_0/0.82)_2.5rem,rgb(0_0_0/0.95)_3rem,#000_3.5rem)]">
            <slot :close="close" />
          </div>
        </div>
      </div>
    </div>

    <!-- Above the surface; while open it blurs out and lets clicks through to the box. -->
    <button
      ref="trigger"
      type="button"
      :aria-label="label"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :aria-controls="panelId"
      :inert="open"
      :class="cn(chatMorphTriggerClass, open ? chatMorphTriggerState.open : chatMorphTriggerState.closed)"
      @click="open = !open"
    >
      <component :is="icon" v-if="icon" class="size-5" />
    </button>
  </div>
</template>
