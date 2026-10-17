<script setup lang="ts">
import { computed, onBeforeUnmount, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { useLabels } from '../../utils/labels'
import Button from '../button/Button.vue'
import IconMorph from '../icon-morph/IconMorph.vue'
import Slider from '../slider/Slider.vue'
import type { StateStripItem, StateStripTone } from './state-strip.types'

/**
 * A stretch of time replayed: one cell per moment, coloured by its state, with a player to walk
 * along it (the day of a shelf, a deploy's checks, a student's term). Only the current cell is at
 * full strength, so where you are reads before what it was; the others wait faintly, and pointing
 * at one lifts it. Pressing a cell, or moving the slider, takes you there and stops the playback.
 *
 * `v-model` is the index of the current moment and `v-model:playing` whether it advances on its own
 * (every `interval` ms, stopping at the end unless `loop`). Playing from the end starts over.
 * The line above reads the current moment in words, so a state is never told by colour alone.
 */
const props = withDefaults(
  defineProps<{
    items: StateStripItem[]
    /** How long each moment stays while playing, in ms. */
    interval?: number
    loop?: boolean
    /** What the strip shows, for screen readers. */
    label?: string
    class?: HTMLAttributes['class']
  }>(),
  { interval: 650 },
)

const current = defineModel<number>({ default: 0 })
const playing = defineModel<boolean>('playing', { default: false })
const labels = useLabels()

const last = computed(() => Math.max(0, props.items.length - 1))
const now = computed(() => props.items[Math.min(current.value, last.value)])
const toneVar: Record<StateStripTone, string> = {
  neutral: 'var(--color-fg-faint)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
}
const nameOf = (item: StateStripItem) => [item.time, item.label, item.flag].filter(Boolean).join(' · ')

let timer: ReturnType<typeof setInterval> | undefined
function stop() {
  clearInterval(timer)
  timer = undefined
}
watch(
  playing,
  (on) => {
    stop()
    if (!on) return
    if (current.value >= last.value) current.value = 0
    timer = setInterval(() => {
      if (current.value < last.value) current.value++
      else if (props.loop) current.value = 0
      else playing.value = false
    }, props.interval)
  },
  { immediate: true },
)
onBeforeUnmount(stop)

function go(index: number) {
  playing.value = false
  current.value = Math.min(last.value, Math.max(0, index))
}
const timeAt = (i: number) => props.items[Math.round(i)]?.time ?? String(Math.round(i) + 1)
</script>

<template>
  <div :class="cn('flex flex-col gap-3', props.class)">
    <div class="flex min-h-6 items-baseline justify-between gap-3" aria-live="polite">
      <span class="text-copy font-medium tabular-nums text-fg">{{ now?.time }}</span>
      <span class="min-w-0 text-right text-ui text-fg-secondary">
        {{ now?.label }}<template v-if="now?.flag"> · {{ now.flag }}</template>
      </span>
    </div>
    <div role="list" :aria-label="label" class="flex h-11 gap-[3px]">
      <button
        v-for="(item, i) in items"
        :key="item.key"
        type="button"
        role="listitem"
        :aria-label="nameOf(item)"
        :aria-current="i === current"
        :class="
          cn(
            'focus-ring relative flex min-w-0 flex-1 cursor-pointer flex-col justify-end overflow-hidden rounded-[4px] bg-[var(--cell)]',
            'opacity-35 transition-[opacity,transform] duration-200 ease-emphasized hover:opacity-65 motion-reduce:transition-none',
            i === current && 'scale-y-110 opacity-100 hover:opacity-100',
          )
        "
        :style="{ '--cell': toneVar[item.tone] }"
        @click="go(i)"
      >
        <span v-if="item.flag" class="block h-1.5 w-full bg-warning" aria-hidden="true" />
      </button>
    </div>
    <div class="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        class="size-8 shrink-0"
        :aria-label="playing ? labels.pause : labels.play"
        @click="playing = !playing"
      >
        <IconMorph :icon="playing ? 'pause' : 'play'" />
      </Button>
      <span class="text-meta tabular-nums text-fg-muted">{{ items[0]?.time }}</span>
      <Slider
        class="flex-1"
        :model-value="current"
        :min="0"
        :max="last"
        :step="1"
        :format="timeAt"
        :label="label"
        @update:model-value="go($event as number)"
      />
      <span class="text-meta tabular-nums text-fg-muted">{{ items[last]?.time }}</span>
    </div>
  </div>
</template>
