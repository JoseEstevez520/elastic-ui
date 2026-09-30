<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { cn } from '../../utils/cn'
import { keyLines, parseLineRanges, type KeyedLine } from '../../utils/lines'
import { prefersReducedMotion } from '../../utils/motion'
import CopyButton from '../copy-button/CopyButton.vue'
import TextMorph from '../text-morph/TextMorph.vue'
import { provideCodeWalkthroughContext, type CodeWalkthroughStepEntry } from './code-walkthrough.context'
import { codeWalkthroughLineVariants, codeWalkthroughPanelClass } from './code-walkthrough.variants'

/**
 * A guide that builds code step by step, as Stripe's docs and Code Hike do: the steps are read on
 * one side while the code stays in view on the other, and turns into each step's code as you get
 * to it. Lines that stay are the same lines and only move; new ones come into focus as a wave,
 * old ones fade out, and what the step is about stands out while the rest steps back (the lines
 * it adds, or its `highlight`). On a narrow screen each step shows its own code instead.
 *
 * Put CodeWalkthroughSteps inside, each with the whole code as it stands at that step.
 */
const props = withDefaults(
  defineProps<{
    /** How far down the viewport a step's top must come to be the one being read, from 0 to 1. */
    line?: number
    class?: HTMLAttributes['class']
  }>(),
  { line: 0.45 },
)

/** The step being read, from 0. */
const active = defineModel<number>('step', { default: 0 })
const steps = ref<CodeWalkthroughStepEntry[]>([])
provideCodeWalkthroughContext({ steps, active })

// The step being read: the last whose top has come up to the reading line. At the very end of the
// page it is the last one, even if it never gets that far up.
function read() {
  const reading = window.innerHeight * props.line
  let current = 0
  steps.value.forEach((step, i) => {
    const top = step.el()?.getBoundingClientRect().top
    if (top !== undefined && top <= reading) current = i
  })
  const end = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
  return end ? Math.max(0, steps.value.length - 1) : current
}
let frame = 0
useEventListener(
  () => window,
  'scroll',
  () => {
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      active.value = read()
    })
  },
  { passive: true },
)
onBeforeUnmount(() => cancelAnimationFrame(frame))

const step = computed(() => steps.value[active.value])
const code = computed(() => step.value?.code().replace(/\n$/, '') ?? '')

// Each line keeps its key while the code changes around it (see `keyLines`). A change plays in
// three beats, so lines never cross one another: the lines that go fade out where they are, then
// the lines that stay slide to their new places while the new ones open their room unseen, then
// the new ones come into focus as a wave, 40ms apart and none past the eighth.
type Line = KeyedLine & { state?: 'leaving' | 'entering' }
const LEAVE = 150
const SETTLE = 250
let nextKey = 0
const lines = ref<Line[]>([])
const added = ref(new Set<number>())
let timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, run: () => void) => timers.push(setTimeout(run, ms))

watch(
  code,
  (next, before) => {
    timers.forEach(clearTimeout)
    timers = []
    const staying = lines.value.filter((line) => line.state !== 'leaving')
    const result = keyLines(staying, next.split('\n'), () => nextKey++)
    added.value = result.added
    const instant = before === undefined || prefersReducedMotion()
    const kept = new Set(result.lines.map((line) => line.key))

    const arrive = () => {
      lines.value = result.lines.map((line) => ({ ...line, state: !instant && result.added.has(line.key) ? 'entering' : undefined }))
      if (!instant) later(SETTLE, () => (lines.value = lines.value.map(({ state: _, ...line }) => line)))
    }
    const leaving = staying.filter((line) => !kept.has(line.key))
    if (instant || !leaving.length) return arrive()
    lines.value = staying.map((line) => (kept.has(line.key) ? line : { ...line, state: 'leaving' }))
    later(LEAVE, arrive)
  },
  { immediate: true },
)
onBeforeUnmount(() => timers.forEach(clearTimeout))

// What the step is about: its `highlight`, or else the lines it adds. The first step adds all of
// its code, so nothing steps back.
const focused = computed(() => {
  const ranges = parseLineRanges(step.value?.highlight())
  const current = lines.value.filter((line) => line.state !== 'leaving')
  if (ranges.size) return current.filter((_, i) => ranges.has(i + 1)).map((line) => line.key)
  return [...added.value]
})
const isFocused = (key: number) => focused.value.includes(key)
const dims = computed(() => focused.value.length > 0 && focused.value.length < lines.value.length)

const delayOf = (line: Line) => {
  if (line.state) return undefined
  const order = [...added.value].indexOf(line.key)
  return order < 0 ? undefined : `${Math.min(order, 8) * 40}ms`
}

// A long file scrolls to what the step is about.
const pre = useTemplateRef<HTMLElement>('pre')
watch(focused, async () => {
  await nextTick()
  const first = pre.value?.querySelector<HTMLElement>('[data-focus]')
  if (!pre.value || !first) return
  const { offsetTop, offsetHeight } = first
  const { scrollTop, clientHeight } = pre.value
  if (offsetTop < scrollTop + 24 || offsetTop + offsetHeight > scrollTop + clientHeight - 24)
    pre.value.scrollTo({ top: offsetTop - 48, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
})
</script>

<template>
  <div :class="cn('grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12', props.class)">
    <div class="flex min-w-0 flex-col gap-12 lg:gap-24 lg:pb-[30vh]">
      <slot />
    </div>
    <div :class="codeWalkthroughPanelClass">
      <div class="flex h-10 shrink-0 items-center justify-between gap-2 pr-1 pl-4 text-meta text-fg-muted">
        <TextMorph class="truncate font-mono" :text="step?.file() ?? ''" />
        <CopyButton :value="code" class="size-8" />
      </div>
      <pre ref="pre" class="relative min-h-0 flex-1 overflow-auto pb-3.5 font-mono text-ui leading-relaxed text-fg scrollbar-subtle"><TransitionGroup
        tag="code"
        class="relative block min-w-fit"
        move-class="transition-transform duration-[400ms] ease-emphasized motion-reduce:transition-none"
      ><div
        v-for="line in lines"
        :key="line.key"
        :data-focus="isFocused(line.key) || undefined"
        :class="codeWalkthroughLineVariants({ state: line.state ?? 'shown', dim: dims && !isFocused(line.key) })"
        :style="{ transitionDelay: delayOf(line) }"
      >{{ line.text }}</div></TransitionGroup></pre>
    </div>
  </div>
</template>
