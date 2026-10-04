<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'
import { computed, ref, useTemplateRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import IconSwap from '../icon-swap/IconSwap.vue'

/**
 * Times of a day on a strip of the day itself, the night a tone deeper than the daylight.
 * Each time is a knob you drag to its hour (every quarter), with its time over it; the sun or
 * the moon in it says which side of the day it is on. Press the strip, or "Add a time", to put
 * another (Enter on the strip does, from the keyboard); arrows move a knob by a quarter (Shift, an hour), Delete takes it away. Times go in and
 * out as "HH:MM", in order.
 */
const props = withDefaults(
  defineProps<{ max?: number; step?: number; label?: string; addLabel?: string; class?: HTMLAttributes['class'] }>(),
  { max: 6, step: 15, label: labelFor('times'), addLabel: labelFor('addTime') },
)
const times = defineModel<string[]>({ default: () => [] })
// What was settled, once a knob is let go or a time is added or removed: not every pixel of a drag.
const emit = defineEmits<{ changed: [times: string[]] }>()

const DAY = 24 * 60
// The night a tone under the day, and a long dawn and dusk between them, so no edge shows.
const NIGHT = 'color-mix(in oklab, var(--color-surface-sunk) 50%, var(--color-surface-raised))'
const DAY_LIGHT = `linear-gradient(to right, ${NIGHT} 0%, ${NIGHT} 14%, var(--color-surface-raised) 36%, var(--color-surface-raised) 66%, ${NIGHT} 88%, ${NIGHT} 100%)`
const pad = (n: number) => String(n).padStart(2, '0')
const toMinutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
const toTime = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
const isDay = (m: number) => m >= 6 * 60 && m < 20 * 60

const minutes = computed(() => times.value.map(toMinutes))
const track = useTemplateRef<HTMLElement>('track')
const dragging = ref(-1)
let dragged = false

// A knob never crosses its neighbours, so each keeps its place in the order.
function clamp(index: number, m: number) {
  const list = minutes.value
  const low = index > 0 ? list[index - 1] + props.step : 0
  const high = index < list.length - 1 ? list[index + 1] - props.step : DAY - props.step
  return Math.min(Math.max(m, low), Math.max(low, high))
}
const snap = (m: number) => Math.round(m / props.step) * props.step
function set(index: number, m: number) {
  const next = [...times.value]
  next[index] = toTime(clamp(index, snap(m)))
  if (next[index] === times.value[index]) return
  times.value = next
  dragged = true
}
function minutesAt(x: number) {
  const box = track.value!.getBoundingClientRect()
  return Math.min(Math.max((x - box.left) / box.width, 0), 1) * DAY
}
function add(m: number) {
  if (times.value.length >= props.max) return
  const at = snap(Math.min(m, DAY - props.step))
  if (minutes.value.includes(at)) return
  times.value = [...times.value, toTime(at)].sort()
  emit('changed', times.value)
}
function remove(index: number) {
  times.value = times.value.filter((_, i) => i !== index)
  emit('changed', times.value)
}

function down(event: PointerEvent, index: number) {
  dragging.value = index
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}
const move = (event: PointerEvent, index: number) => dragging.value === index && set(index, minutesAt(event.clientX))
function up() {
  dragging.value = -1
  if (dragged) emit('changed', times.value)
  dragged = false
}

function key(event: KeyboardEvent, index: number) {
  const jump = event.shiftKey ? 60 : props.step
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') set(index, minutes.value[index] + jump)
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') set(index, minutes.value[index] - jump)
  else if (event.key === 'Delete' || event.key === 'Backspace') remove(index)
  else return
  event.preventDefault()
  // A key press is settled at once.
  if (dragged) up()
}

// The first free quarter after the last time, for "Add a time" without a pointer.
function addNext() {
  const last = minutes.value.length ? Math.max(...minutes.value) : 2 * 60 + 45
  add((last + 60) % DAY)
}
</script>

<template>
  <div :class="cn('w-full max-w-md', props.class)">
    <div role="group" :aria-label="label" class="relative pt-7">
      <div
        ref="track"
        tabindex="0"
        :aria-label="addLabel"
        class="relative h-12 cursor-copy rounded-lg"
        :style="{
          background: DAY_LIGHT,
        }"
        @pointerdown.self="add(minutesAt($event.clientX))"
        @keydown.self.enter.prevent="addNext"
      >
        <div
          v-for="(time, i) in times"
          :key="time + i"
          class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          :style="{ left: `${(minutes[i] / DAY) * 100}%` }"
        >
          <span class="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 text-meta tabular-nums text-fg-secondary">{{ time }}</span>
          <div
            role="slider"
            tabindex="0"
            :aria-label="`${label} ${i + 1}`"
            aria-valuemin="0"
            :aria-valuemax="DAY - step"
            :aria-valuenow="minutes[i]"
            :aria-valuetext="time"
            class="flex size-6 cursor-grab touch-none items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] text-fg shadow-soft transition-[border-color] duration-150 hover:border-[color:var(--color-fg-faint)] focus-ring active:cursor-grabbing"
            @pointerdown="down($event, i)"
            @pointermove="move($event, i)"
            @pointerup="up"
            @pointercancel="up"
            @keydown="key($event, i)"
            @dblclick="remove(i)"
          >
            <IconSwap :icon="isDay(minutes[i]) ? Sun : Moon" class="size-3.5" />
          </div>
        </div>
      </div>
      <div class="mt-1.5 flex justify-between text-meta tabular-nums text-fg-faint" aria-hidden="true">
        <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
      </div>
    </div>
  </div>
</template>
