<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch, type HTMLAttributes } from 'vue'
import Button from '../button/Button.vue'
import { usePortalTarget } from '../../composables/usePortalTarget'
import { useEventListener } from '../../composables/useEventListener'
import { boxOf, type Box } from '../../composables/useMorphBox'
import { cn } from '../../utils/cn'
import { labelFor, useLabels } from '../../utils/labels'
import { prefersReducedMotion } from '../../utils/motion'
import { provideTourContext, type TourStepMeta } from './tour.context'

/**
 * A guided tour of the real app, a step at a time. Each `TourStep` names the element it
 * explains with a `target` (a `data-tour="name"` attribute anywhere in the app, found live, as
 * Popover measures its trigger). A soft tint and a ring sit on the element, with a small card
 * beside it carrying the text and the controls; moving on, the ring and the card travel to the
 * next element rather than disappearing and reappearing (Philosophy 1: nothing appears or
 * disappears without a transition). No dark veil with a hole cut in it: that is the spectacle the
 * library avoids (Philosophy 2, "fewer boxes"). A step on another screen gets there first: await
 * `beforeStep`, given that step's meta (its `to`), before the target is measured — the ring and
 * card hold their place until it resolves, rather than vanishing while the app navigates.
 */
const props = withDefaults(
  defineProps<{
    label?: string
    nextLabel?: string
    backLabel?: string
    skipLabel?: string
    /** Awaited before a step is measured; an app with routes navigates here, from the step's `to`. */
    beforeStep?: (meta: TourStepMeta) => unknown
    class?: HTMLAttributes['class']
  }>(),
  { label: labelFor('tour'), nextLabel: labelFor('next'), backLabel: labelFor('back'), skipLabel: labelFor('skip') },
)
const open = defineModel<boolean>('open', { default: true })
const emit = defineEmits<{ finish: [] }>()
defineSlots<{ default?(): unknown }>()

const active = ref(0)
const ids = ref<string[]>([])
const metas = ref<Record<string, TourStepMeta>>({})
const labels = useLabels()

function next() {
  if (active.value < ids.value.length - 1) active.value++
  else {
    open.value = false
    emit('finish')
  }
}
function back() {
  if (active.value > 0) active.value--
}
function skip() {
  open.value = false
  emit('finish')
}
provideTourContext({
  active,
  ids,
  metas,
  register: (id, meta) => (metas.value[id] = meta),
  unregister: (id) => delete metas.value[id],
  next,
  back,
  skip,
})

const currentId = computed(() => ids.value[active.value])
const currentMeta = computed(() => (currentId.value ? metas.value[currentId.value] : undefined))

// The current step's element, found live: never cached across a render, since the app around it
// may lay out differently step to step (a folded section opening, say).
const box = ref<Box>()
function measure() {
  if (!currentMeta.value) return
  const el = document.querySelector<HTMLElement>(`[data-tour="${currentMeta.value.target}"]`)
  box.value = boxOf(el)
  el?.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}
useEventListener(() => window, 'resize', measure)
useEventListener(() => window, 'scroll', measure, { capture: true })
watch(
  currentId,
  async () => {
    const meta = currentId.value ? metas.value[currentId.value] : undefined
    if (meta && props.beforeStep) await props.beforeStep(meta)
    await nextTick()
    measure()
  },
  { immediate: true },
)

const PADDING = 6
const ringStyle = computed(() => {
  const b = box.value
  if (!b) return { opacity: 0 }
  return {
    top: `${b.top - PADDING}px`,
    left: `${b.left - PADDING}px`,
    width: `${b.width + PADDING * 2}px`,
    height: `${b.height + PADDING * 2}px`,
  }
})
// The card sits under the target, flipped above it when there isn't room below.
const CARD_WIDTH = 320
const cardStyle = computed(() => {
  const b = box.value
  if (!b) return { opacity: 0 }
  const bottom = b.top + b.height
  const below = window.innerHeight - bottom > 220
  const top = below ? bottom + PADDING + 10 : b.top - PADDING - 10
  const left = Math.min(Math.max(b.left, 16), window.innerWidth - CARD_WIDTH - 16)
  return { top: `${top}px`, left: `${left}px`, transform: below ? undefined : 'translateY(-100%)' }
})

function onKeydown(event: KeyboardEvent) {
  if (!open.value) return
  if (event.key === 'Escape') skip()
  else if (event.key === 'ArrowRight' || event.key === 'Enter') next()
  else if (event.key === 'ArrowLeft') back()
  else return
  event.preventDefault()
}
useEventListener<KeyboardEvent>(() => document, 'keydown', onKeydown)

const portalTo = usePortalTarget()
const total = computed(() => ids.value.length)
const ofLabel = computed(() => `${active.value + 1} ${labels.of} ${total.value}`)
onBeforeUnmount(() => (metas.value = {}))
</script>

<template>
  <slot />
  <Teleport :to="portalTo">
    <div v-if="open && currentMeta" role="dialog" :aria-label="label" :class="cn('fixed inset-0 z-50 pointer-events-none', props.class)">
      <!-- The ring: a tint and a border round the element, never a dark veil over the rest. -->
      <div
        class="absolute rounded-[var(--radius-md)] ring-2 ring-[color:var(--color-accent)] transition-[top,left,width,height] duration-[520ms] ease-emphasized motion-reduce:transition-none"
        :style="{ ...ringStyle, background: 'color-mix(in oklab, var(--color-accent) 10%, transparent)' }"
        aria-hidden="true"
      />
      <!-- The card: travels with the ring, never appearing from nowhere. -->
      <div
        class="pointer-events-auto absolute rounded-[var(--radius-lg)] bg-surface-raised p-4 shadow-overlay transition-[top,left] duration-[520ms] ease-emphasized motion-reduce:transition-none"
        :style="{ width: `${CARD_WIDTH}px`, ...cardStyle }"
      >
        <p class="m-0 text-meta text-fg-faint">{{ ofLabel }}</p>
        <h3 class="m-0 mt-1 text-label text-fg">{{ currentMeta?.title }}</h3>
        <div v-if="currentMeta?.body" class="mt-2 text-copy text-fg-secondary">
          <component :is="currentMeta.body" />
        </div>
        <div class="mt-4 flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" @click="skip">{{ skipLabel }}</Button>
          <div class="flex gap-2">
            <Button v-if="active > 0" variant="ghost" size="sm" @click="back">{{ backLabel }}</Button>
            <Button size="sm" @click="next">{{ nextLabel }}</Button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
