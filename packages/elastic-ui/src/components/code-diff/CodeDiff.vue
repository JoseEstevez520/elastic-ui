<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, type HTMLAttributes } from 'vue'
import { ReplayIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { labelFor, useLabels } from '../../utils/labels'
import { diffLines } from '../../utils/lines'
import { prefersReducedMotion } from '../../utils/motion'
import { codeBlockClass } from '../code-block/code-block.variants'
import CopyButton from '../copy-button/CopyButton.vue'
import { codeDiffLineVariants, codeDiffSignVariants } from './code-diff.variants'

/**
 * A change to a file, as an agent's edit or a step of a guide: the old code and the new in one
 * view, removed lines tinted red and added ones green, with a count of each. Long runs of lines
 * the change leaves alone fold away, three lines of context kept around it.
 *
 * The first time it comes into view it plays the edit: the old code shows, the lines that go turn
 * red, then the new ones open their room and come into focus as a wave. It can be replayed.
 */
const props = withDefaults(
  defineProps<{
    before: string
    after: string
    /** The file changed, named on the caption. */
    file?: string
    /** Play the edit when it first comes into view. */
    animate?: boolean
    /** Replay's accessible name. */
    replayLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  { animate: true, replayLabel: labelFor('replay') },
)

const labels = useLabels()
const lines = computed(() => diffLines(props.before, props.after))
const count = computed(() => ({
  added: lines.value.filter((line) => line.type === 'added').length,
  removed: lines.value.filter((line) => line.type === 'removed').length,
}))

// Runs of more than this many untouched lines fold, keeping CONTEXT lines on each side.
const CONTEXT = 3
const FOLD = CONTEXT * 2 + 2
const unfolded = ref(new Set<number>())
type Row = { kind: 'line'; index: number } | { kind: 'fold'; start: number; size: number }
const rows = computed<Row[]>(() => {
  const out: Row[] = []
  let i = 0
  while (i < lines.value.length) {
    if (lines.value[i]!.type !== 'same') {
      out.push({ kind: 'line', index: i++ })
      continue
    }
    let end = i
    while (end < lines.value.length && lines.value[end]!.type === 'same') end++
    const first = i === 0
    const last = end === lines.value.length
    const keepBefore = first ? 0 : CONTEXT
    const keepAfter = last ? 0 : CONTEXT
    const hidden = end - i - keepBefore - keepAfter
    if (hidden >= FOLD - CONTEXT * 2 && !unfolded.value.has(i + keepBefore)) {
      for (let k = i; k < i + keepBefore; k++) out.push({ kind: 'line', index: k })
      out.push({ kind: 'fold', start: i + keepBefore, size: hidden })
      for (let k = end - keepAfter; k < end; k++) out.push({ kind: 'line', index: k })
    } else for (let k = i; k < end; k++) out.push({ kind: 'line', index: k })
    i = end
  }
  return out
})
const unfold = (start: number) => (unfolded.value = new Set([...unfolded.value, start]))

// The edit in three beats: the old code, then the lines that go turn red, then the new ones open
// their room and come in. `done` is the diff at rest.
type Phase = 'before' | 'marked' | 'done'
const phase = ref<Phase>(props.animate ? 'before' : 'done')
let timers: ReturnType<typeof setTimeout>[] = []
function play() {
  timers.forEach(clearTimeout)
  if (prefersReducedMotion()) return void (phase.value = 'done')
  phase.value = 'before'
  timers = [setTimeout(() => (phase.value = 'marked'), 350), setTimeout(() => (phase.value = 'done'), 900)]
}

const root = useTemplateRef<HTMLElement>('root')
let observer: IntersectionObserver | undefined
onMounted(() => {
  if (!props.animate) return
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      observer?.disconnect()
      play()
    },
    { threshold: 0.6 },
  )
  if (root.value) observer.observe(root.value)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  timers.forEach(clearTimeout)
})

const typeOf = (index: number) => {
  const type = lines.value[index]!.type
  return type === 'removed' && phase.value === 'before' ? 'pending' : type
}
// Added lines: their order among the added, for the wave (40ms apart, none past the eighth).
const addedOrder = computed(() => {
  const order = new Map<number, number>()
  lines.value.forEach((line, i) => line.type === 'added' && order.set(i, order.size))
  return order
})
const shown = (index: number) => lines.value[index]!.type !== 'added' || phase.value === 'done'
</script>

<template>
  <figure ref="root" :class="cn(codeBlockClass, 'overflow-hidden', props.class)">
    <figcaption class="flex h-10 items-center gap-3 pr-1 pl-4 text-meta text-fg-muted">
      <span class="min-w-0 flex-1 truncate font-mono">{{ file }}</span>
      <span class="font-mono tabular-nums">
        <span class="text-[color:var(--color-success)]">+{{ count.added }}</span>
        <span class="ml-1.5 text-[color:var(--color-danger)]">−{{ count.removed }}</span>
      </span>
      <button
        v-if="animate"
        type="button"
        :aria-label="replayLabel"
        class="flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:text-fg focus-ring"
        @click="play"
      >
        <ReplayIcon class="size-3.5" aria-hidden="true" />
      </button>
      <CopyButton :value="after" class="size-8" />
    </figcaption>
    <pre tabindex="0" class="overflow-x-auto pb-3 font-mono text-ui leading-relaxed scrollbar-subtle focus-ring-inset"><code class="block min-w-fit"><template v-for="row in rows" :key="row.kind === 'line' ? row.index : `fold-${row.start}`"><button
      v-if="row.kind === 'fold'"
      type="button"
      class="block w-full cursor-pointer px-4 py-1 text-left font-sans text-meta text-fg-muted transition-colors hover:text-fg"
      @click="unfold(row.start)"
    >⋯ {{ labels.unchangedLines.replace('{count}', String(row.size)) }}</button><div
      v-else
      :class="[
        'grid transition-[grid-template-rows] duration-[400ms] ease-emphasized motion-reduce:transition-none',
        shown(row.index) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
      ]"
    ><div class="overflow-hidden"><div
      :class="[
        codeDiffLineVariants({ type: typeOf(row.index) }),
        lines[row.index]!.type === 'added' && (shown(row.index) ? 'animate-[blur-in_0.45s_var(--ease-soft)_both] motion-reduce:animate-none' : 'opacity-0'),
      ]"
      :style="lines[row.index]!.type === 'added' ? { animationDelay: `${150 + Math.min(addedOrder.get(row.index) ?? 0, 8) * 40}ms` } : undefined"
    ><span v-if="lines[row.index]!.type !== 'same'" class="sr-only">{{ lines[row.index]!.type === 'added' ? labels.addedLine : labels.removedLine }}: </span><span aria-hidden="true" :class="codeDiffSignVariants({ type: typeOf(row.index) })">{{ lines[row.index]!.type === 'added' ? '+' : lines[row.index]!.type === 'removed' ? '−' : ' ' }}</span><span>{{ lines[row.index]!.text || ' ' }}</span></div></div></div></template></code></pre>
  </figure>
</template>
