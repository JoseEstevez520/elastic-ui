<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { usePlayInTurn } from '../../composables/usePlayInTurn'
import { CheckIcon, ReplayIcon, XIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { useLabels } from '../../utils/labels'
import { prefersReducedMotion } from '../../utils/motion'
import { codeBlockClass } from '../code-block/code-block.variants'
import CopyButton from '../copy-button/CopyButton.vue'
import type { TerminalReplayEntry } from './terminal-replay.types'

/**
 * A terminal session played back, with no fake cursor: each command comes in word by word, as the
 * library's wave, runs a moment, and what it printed comes in line by line; a comment above a
 * command says what it is for. It plays once in view (one at a time, with AgentReplay), holding its full height from
 * the start so nothing below it moves, and can be replayed. Copying takes the commands alone.
 */
const props = withDefaults(
  defineProps<{
    entries: TerminalReplayEntry[]
    /** Where it runs, named on the caption: "~/tasks-api". */
    title?: string
    /** The prompt before each command. */
    prompt?: string
    class?: HTMLAttributes['class']
  }>(),
  { prompt: '$' },
)
const labels = useLabels()

type Row =
  | { kind: 'comment'; entry: number; text: string }
  | { kind: 'command'; entry: number; words: string[] }
  | { kind: 'output'; entry: number; text: string; tone?: 'passed' | 'failed' }

const toneOf = (line: string): 'passed' | 'failed' | undefined =>
  /^\s*[✔✓]/.test(line) ? 'passed' : /^\s*([✖✗]|error\b)/i.test(line) ? 'failed' : undefined
// A ✔ or ✖ that starts a line is drawn as the library's own check or cross, not as the glyph,
// which many fonts turn into an emoji.
const MARK = /^(\s*)[✔✓✖✗]\s?/

// Every row there will be, laid out from the start so the block never grows.
const rows = computed<Row[]>(() =>
  props.entries.flatMap((entry, i) => [
    ...(entry.comment ? [{ kind: 'comment' as const, entry: i, text: `# ${entry.comment}` }] : []),
    { kind: 'command' as const, entry: i, words: entry.command.split(/(?<=\s)/) },
    ...(entry.output?.replace(/\n$/, '').split('\n') ?? []).map((text) => ({ kind: 'output' as const, entry: i, text, tone: toneOf(text) })),
  ]),
)

// How far it has got: rows before `row` are shown; in the command at `row`, `words` of them.
const row = ref(0)
const words = ref(0)
const playing = ref(false)

const WORD = 90
const LINE = 45
const RUN = 500
const PAUSE = 600

let timer: ReturnType<typeof setTimeout> | undefined
const later = (ms: number, run: () => void) => (timer = setTimeout(run, ms))

function step() {
  const current = rows.value[row.value]
  if (!current) return (playing.value = false)
  if (current.kind === 'command' && words.value < current.words.length) {
    words.value++
    return later(WORD, step)
  }
  const next = rows.value[row.value + 1]
  row.value++
  words.value = 0
  if (current.kind === 'command') return later(props.entries[current.entry]?.duration ?? RUN, step)
  if (next?.kind === 'output') return later(LINE, step)
  later(next ? PAUSE : 0, step)
}

function play() {
  clearTimeout(timer)
  row.value = 0
  words.value = 0
  if (prefersReducedMotion()) return void (row.value = rows.value.length)
  playing.value = true
  step()
}
onBeforeUnmount(() => clearTimeout(timer))

const root = useTemplateRef<HTMLElement>('root')
usePlayInTurn(root, playing, play)
watch(() => props.entries, play)

const commands = computed(() => props.entries.map((entry) => entry.command).join('\n'))
const shownRow = (i: number) => i < row.value
const typing = (i: number) => i === row.value && playing.value
</script>

<template>
  <figure ref="root" :class="cn(codeBlockClass, props.class)">
    <figcaption class="flex h-10 items-center gap-2 pr-1 pl-4 text-xs text-fg-muted">
      <span class="min-w-0 flex-1 truncate font-mono">{{ title }}</span>
      <button
        type="button"
        :aria-label="labels.replay"
        class="flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:text-fg focus-ring"
        @click="play"
      >
        <ReplayIcon class="size-3.5" aria-hidden="true" />
      </button>
      <CopyButton :value="commands" class="size-8" />
    </figcaption>
    <!-- Every row is laid out from the start, unseen until its turn, so the block keeps its height;
         a command holds only its words come in so far. -->
    <pre
      tabindex="0"
      :aria-busy="playing || undefined"
      class="overflow-x-auto px-4 pt-0 pb-3.5 font-mono text-[13px] leading-relaxed text-fg scrollbar-subtle focus-ring"
    ><code class="block min-w-fit"><div
      v-for="(r, i) in rows"
      :key="i"
      :class="[
        'min-h-[1lh] whitespace-pre',
        r.kind === 'comment' && 'text-fg-muted',
        r.kind === 'output' && (r.tone === 'passed' ? 'text-[color:var(--color-success)]' : r.tone === 'failed' ? 'text-[color:var(--color-danger)]' : 'text-fg-secondary'),
        r.kind !== 'command' && (shownRow(i) ? 'animate-blur-in motion-reduce:animate-none' : 'invisible'),
        r.kind === 'command' && !shownRow(i) && !typing(i) && 'invisible',
        // A breath between one command and what it printed and the next.
        i > 0 && rows[i - 1]?.entry !== r.entry && 'mt-3',
      ]"
    ><template v-if="r.kind === 'command'"><span class="text-fg-faint select-none">{{ prompt }} </span><span
      v-for="(word, w) in shownRow(i) ? r.words : r.words.slice(0, words)"
      :key="w"
      class="animate-blur-in motion-reduce:animate-none"
    >{{ word }}</span></template><template v-else-if="r.kind === 'output' && MARK.test(r.text)">{{ MARK.exec(r.text)![1] }}<component
      :is="r.tone === 'passed' ? CheckIcon : XIcon"
      aria-hidden="true"
      class="mr-1.5 inline size-3.5 -translate-y-px"
    /><span class="sr-only">{{ r.tone === 'passed' ? '✔' : '✖' }} </span>{{ r.text.replace(MARK, '') }}</template><template v-else>{{ r.text || ' ' }}</template></div></code></pre>
  </figure>
</template>
