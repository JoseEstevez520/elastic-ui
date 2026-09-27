<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef, type Component, type HTMLAttributes } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { cn } from '../../utils/cn'
import Liquid from '../liquid/Liquid.vue'
import type { SplitAction } from './split-actions.types'

/**
 * Internal: SplitActions' `row` and `fan`, as liquid (DECISIONS, "Morph or liquid"): pressed, the
 * button lets go of a few round drops, one after another, each pulling out of it by a neck before
 * it is free, and each action's icon comes in once its drop has. Pressing it again, choosing an
 * action, Escape or a click elsewhere melts them back into it, the icons going first. `row`, the
 * drops line up beside the button, its label showing; `fan`, the button is a round icon and the
 * drops fan out above it.
 */
const props = withDefaults(
  defineProps<{
    label: string
    icon: Component
    actions: SplitAction[]
    layout?: 'row' | 'fan'
    class?: HTMLAttributes['class']
  }>(),
  { layout: 'row' },
)
const emit = defineEmits<{ select: [action: SplitAction] }>()

const open = ref(false)
const root = useTemplateRef<{ $el: HTMLElement }>('root')
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const buttons = ref<HTMLButtonElement[]>([])

const SIZE = 44
const GAP = 8
const RADIUS = 66
// The row's pill is as wide as its label; measured, so the drops leave from its end.
const pill = ref(SIZE)
onMounted(() => (pill.value = trigger.value?.offsetWidth ?? SIZE))

// Where each drop is, from the trigger's top left: tucked under the trigger, or out at its place.
function at(i: number) {
  const n = props.actions.length
  if (props.layout === 'row') return { x: open.value ? pill.value + GAP + i * (SIZE + GAP) : pill.value - SIZE, y: 0 }
  if (!open.value) return { x: 0, y: 0 }
  // Fanned over the top of the trigger, from the upper left to the upper right.
  const angle = ((n === 1 ? 270 : 200 + (i * 140) / (n - 1)) * Math.PI) / 180
  return { x: Math.cos(angle) * RADIUS, y: Math.sin(angle) * RADIUS }
}
const reach = computed(() => (props.layout === 'row' ? props.actions.length * (SIZE + GAP) + GAP : RADIUS + SIZE))

// Out one after another; back the other way round, once their icons have gone.
const dropStyle = (i: number) => {
  const p = at(i)
  const n = props.actions.length
  const delay = open.value ? i * 60 : 120 + (n - 1 - i) * 40
  return {
    left: `${p.x}px`,
    top: `${p.y}px`,
    transition: `left 500ms var(--ease-glide) ${delay}ms, top 500ms var(--ease-glide) ${delay}ms`,
  }
}
const iconStyle = (i: number) => {
  const p = at(i)
  const drop = dropStyle(i)
  return {
    left: `${p.x}px`,
    top: `${p.y}px`,
    // Its icon waits until its drop has pulled free, so nothing shows over the liquid while drops
    // are still joined; closing, the icons go first.
    transition: open.value
      ? `${drop.transition}, opacity 250ms linear ${i * 60 + 380}ms`
      : `${drop.transition}, opacity 120ms linear`,
  }
}

async function toggle() {
  open.value = !open.value
  if (open.value) {
    await nextTick()
    buttons.value[0]?.focus({ preventScroll: true })
  }
}
function close(focusTrigger = true) {
  if (!open.value) return
  open.value = false
  if (focusTrigger) trigger.value?.focus({ preventScroll: true })
}
function choose(action: SplitAction) {
  action.onSelect?.()
  emit('select', action)
  close()
}
function onKey(e: KeyboardEvent, i: number) {
  const n = props.actions.length
  const step =
    e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
  if (!step) return
  e.preventDefault()
  buttons.value[(i + step + n) % n]?.focus()
}
useEventListener<KeyboardEvent>(
  () => document,
  'keydown',
  (e) => e.key === 'Escape' && close(),
)
useEventListener<PointerEvent>(
  () => document,
  'pointerdown',
  (e) => {
    if (open.value && e.target instanceof Node && !root.value?.$el.contains(e.target)) close(false)
  },
)
</script>

<template>
  <Liquid
    ref="root"
    role="group"
    :aria-label="label"
    :overflow="reach"
    :class="cn('inline-flex h-11 align-middle', layout === 'fan' && 'w-11', props.class)"
  >
    <template #shapes>
      <div
        class="absolute top-0 left-0 h-11 rounded-full bg-black"
        :style="{ width: `${layout === 'row' ? pill : SIZE}px` }"
      />
      <div
        v-for="(action, i) in actions"
        :key="action.label"
        class="absolute size-11 rounded-full bg-black motion-reduce:transition-none"
        :style="dropStyle(i)"
      />
    </template>
    <button
      ref="trigger"
      type="button"
      :aria-label="layout === 'fan' ? label : undefined"
      :aria-expanded="open ? 'true' : 'false'"
      :class="[
        'relative flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full text-label text-fg focus-ring',
        layout === 'row' ? 'px-5' : 'w-11',
      ]"
      @click="toggle"
    >
      <component :is="icon" aria-hidden="true" class="size-4" />
      <span v-if="layout === 'row'">{{ label }}</span>
    </button>
    <button
      v-for="(action, i) in actions"
      :key="action.label"
      :ref="(el) => el && (buttons[i] = el as HTMLButtonElement)"
      type="button"
      :aria-label="action.label"
      :tabindex="open ? 0 : -1"
      :class="[
        'absolute flex size-11 cursor-pointer items-center justify-center rounded-full text-fg-secondary hover:text-fg focus-ring motion-reduce:transition-none',
        open ? 'opacity-100' : 'pointer-events-none opacity-0',
      ]"
      :style="iconStyle(i)"
      @click="choose(action)"
      @keydown="onKey($event, i)"
    >
      <component :is="action.icon" aria-hidden="true" class="size-4" />
    </button>
  </Liquid>
</template>
