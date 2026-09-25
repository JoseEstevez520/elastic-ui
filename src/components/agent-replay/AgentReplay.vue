<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { usePlayInTurn } from '../../composables/usePlayInTurn'
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon, ReplayIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { useLabels } from '../../utils/labels'
import { prefersReducedMotion } from '../../utils/motion'
import Aurora, { type AuroraActivity } from '../aurora/Aurora.vue'
import Button from '../button/Button.vue'
import ChatMessage from '../chat/ChatMessage.vue'
import ChatThread from '../chat/ChatThread.vue'
import ChatTool from '../chat/ChatTool.vue'
import { chatGlassStyle } from '../chat/chat.variants'
import CodeBlock from '../code-block/CodeBlock.vue'
import CodeDiff from '../code-diff/CodeDiff.vue'
import TextMorph from '../text-morph/TextMorph.vue'
import type { AgentReplayEvent, AgentReplayStep } from './agent-replay.types'

/**
 * A session with an agent, played back to explain how it works: what you asked, then what it does
 * on its way (searching, reading, running, editing), each step shimmering while it runs and turning
 * into what it did, then its answer flowing in. A step may stop to ask your permission, or be
 * refused; a subagent's step plays its own small session inside it. Beside it, a note for each
 * moment says what to notice, the last one standing out once it has played, as the conclusion. At
 * rest it shows what you asked; it plays on its own once it is in full view (one at a time, when
 * several are on screen), over an Aurora that follows the work, and can be
 * paused and stepped through, back and forth. Given new `events`, it plays them
 * from the start. To compare two sessions, set them side by side (`layout="stacked"`) or one after
 * the other.
 */
const props = defineProps<{
  events: AgentReplayEvent[]
  /** The note before anything has happened. */
  intro?: string
  /**
   * Where the notes and controls go: beside the session (`side`, on wide screens), or under it
   * (`stacked`), as when two sessions are compared side by side.
   */
  layout?: 'side' | 'stacked'
  class?: HTMLAttributes['class']
}>()
const labels = useLabels()

// How far it has got: `shown` events are on screen; the last is in `phase`, and the rest have
// finished. A step that asks waits in `asking` until it is answered (`decision`).
type Phase = 'settled' | 'running' | 'asking'
// At rest it already shows what you asked, so it is never an empty box before it plays.
const base = () => (props.events[0]?.kind === 'prompt' ? 1 : 0)
const shown = ref(base())
const phase = ref<Phase>('settled')
const decision = ref<'allowed' | 'denied'>()
const playing = ref(false)
const nested = ref(0)

const current = computed(() => props.events[shown.value - 1])
const prompt = computed(() => props.events.find((event) => event.kind === 'prompt'))
const visible = computed(() => props.events.slice(0, shown.value))
const answer = computed(() => visible.value.find((event) => event.kind === 'answer'))
const isLast = (i: number) => i === shown.value - 1

// How a step ended: refused if its permission says so, or if you denied it.
function refused(event: AgentReplayStep, i: number) {
  if (event.permission === 'deny') return true
  if (event.permission === 'ask-deny' || event.permission === 'ask-allow') {
    if (isLast(i) && decision.value) return decision.value === 'denied'
    return event.permission === 'ask-deny'
  }
  return false
}
const steps = computed(() =>
  visible.value.flatMap((event, i) => {
    if (event.kind !== 'step') return []
    const live = isLast(i) && phase.value !== 'settled'
    const state = live ? 'running' : refused(event, i) ? 'error' : 'done'
    const label = live ? (phase.value === 'asking' ? (event.asking ?? labels.askingPermission) : event.running) : event.done
    return [{ event, i, state: state as 'running' | 'done' | 'error', label }]
  }),
)
const answering = computed(() => current.value?.kind === 'answer' && phase.value === 'running')
// The agent's side shows once it has something to say, or while it thinks after your message.
const replying = computed(() => shown.value > 0 && (visible.value.some((event) => event.kind !== 'prompt') || playing.value))

// The aurora hurries while it thinks or works, flows while the answer comes, and rests otherwise.
const activity = computed<AuroraActivity>(() => {
  if (answering.value) return 'answering'
  if (phase.value === 'running' || (playing.value && current.value?.kind === 'prompt')) return 'thinking'
  return 'rest'
})

// Timing: a step runs for its own time (split around a question), an answer about as long as it
// takes to read in, and a short pause follows each before the next begins.
const STEP = 1400
const ASK = 1600
const PAUSE = 700
const THINK = 1000
const lengthOf = (event: AgentReplayEvent | undefined) => {
  if (!event || event.kind === 'prompt') return 0
  if (event.kind === 'answer') return Math.min(3000, 900 + event.text.length * 6)
  return event.duration ?? (event.session ? event.session.length * 900 + 400 : STEP)
}

let timer: ReturnType<typeof setTimeout> | undefined
let ticker: ReturnType<typeof setInterval> | undefined
const wait = (ms: number, run: () => void) => {
  clearTimeout(timer)
  timer = setTimeout(run, prefersReducedMotion() ? 0 : ms)
}
const stopTimers = () => {
  clearTimeout(timer)
  clearInterval(ticker)
}

// Finishes the current event and, while playing, moves on after a pause.
function settle() {
  stopTimers()
  const event = current.value
  if (event?.kind === 'step' && event.session) nested.value = event.session.length
  phase.value = 'settled'
  if (playing.value) wait(PAUSE, reveal)
}

// Runs a step: all of it, or up to its question and then the rest once answered. A subagent's
// session plays inside it over the same time.
function run(event: AgentReplayStep, ms: number) {
  phase.value = 'running'
  if (event.session) {
    const every = ms / (event.session.length + 1)
    clearInterval(ticker)
    ticker = setInterval(() => (nested.value = Math.min(nested.value + 1, event.session!.length)), every)
  }
  wait(ms, () => {
    const asks = event.permission === 'ask-allow' || event.permission === 'ask-deny'
    if (asks && !decision.value) return ask(event)
    settle()
  })
}
function ask(event: AgentReplayStep) {
  phase.value = 'asking'
  // The script answers after a moment while playing; paused, it waits for you.
  if (playing.value) wait(ASK, () => decide(event.permission === 'ask-deny' ? 'denied' : 'allowed'))
}
function decide(choice: 'allowed' | 'denied') {
  const event = current.value
  if (phase.value !== 'asking' || event?.kind !== 'step') return
  decision.value = choice
  if (choice === 'denied') return settle()
  run(event, lengthOf(event) / 2)
}

function reveal() {
  if (shown.value >= props.events.length) return (playing.value = false)
  shown.value++
  decision.value = undefined
  nested.value = 0
  const event = current.value!
  if (event.kind === 'prompt') {
    phase.value = 'settled'
    if (playing.value) wait(THINK, reveal)
    return
  }
  if (event.kind === 'answer') {
    phase.value = 'running'
    return wait(lengthOf(event), settle)
  }
  const asks = event.permission === 'ask-allow' || event.permission === 'ask-deny'
  run(event, asks || event.permission === 'deny' ? lengthOf(event) / 2 : lengthOf(event))
}

function play() {
  if (shown.value >= props.events.length && phase.value === 'settled') restart()
  playing.value = true
  // Right after your message, it thinks a moment before the first step.
  if (phase.value === 'settled' && current.value?.kind === 'prompt') wait(THINK, reveal)
  else if (phase.value === 'settled') reveal()
  else if (phase.value === 'asking') ask(current.value as AgentReplayStep)
  else settle()
}
function pause() {
  playing.value = false
  stopTimers()
  // A question stays open for you to answer; anything else finishes where it is.
  if (phase.value === 'running') settle()
}
function next() {
  const wasAsking = phase.value === 'asking'
  pause()
  if (wasAsking) decide((current.value as AgentReplayStep).permission === 'ask-deny' ? 'denied' : 'allowed')
  else reveal()
}
function previous() {
  pause()
  phase.value = 'settled'
  decision.value = undefined
  shown.value = Math.max(base(), shown.value - 1)
  const event = current.value
  nested.value = event?.kind === 'step' && event.session ? event.session.length : 0
}
function restart() {
  pause()
  phase.value = 'settled'
  shown.value = base()
}

// It starts on its own the first time it comes into view, one at a time; new events play from
// the start.
const root = useTemplateRef<HTMLElement>('root')
const { hasStarted } = usePlayInTurn(root, playing, play)
watch(
  () => props.events,
  () => {
    restart()
    if (hasStarted()) play()
  },
)
onBeforeUnmount(stopTimers)

const note = computed(() => (shown.value ? current.value?.note : props.intro))
const finished = computed(() => shown.value === props.events.length && phase.value === 'settled')
const counter = computed(() => labels.stepOf.replace('{current}', String(shown.value)).replace('{total}', String(props.events.length)))

// A step opens on its own while a subagent works inside it, and an edit once made: they are what
// the session is about. Anything else opens when you ask.
const opened = ref(new Set<number>())
watch(shown, () => (opened.value = new Set()))
const isOpen = (step: { i: number; event: AgentReplayStep; state: string }) =>
  opened.value.has(step.i) || (!!step.event.session && isLast(step.i)) || (!!step.event.diff && step.state === 'done' && isLast(step.i))
const setOpen = (i: number, value: boolean) => {
  const next = new Set(opened.value)
  if (value) next.add(i)
  else next.delete(i)
  opened.value = next
}
const sessionOf = (step: { i: number; event: AgentReplayStep }) => {
  const session = step.event.session ?? []
  return isLast(step.i) ? session.slice(0, nested.value) : session
}

// Inside a subagent's step still running, its latest step is the one at work.
const innerRunning = (step: { i: number; state: string }, n: number) => isLast(step.i) && step.state === 'running' && n === nested.value - 1

const controlClass =
  'flex size-9 cursor-pointer items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-bg-muted hover:text-fg focus-ring disabled:pointer-events-none disabled:opacity-40'
</script>

<template>
  <div
    ref="root"
    :class="cn('grid gap-6', layout !== 'stacked' && 'lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-10', props.class)"
  >
    <!-- The session, over an Aurora that follows the work. -->
    <Aurora
      :activity="activity"
      :settled="shown > 0"
      :style="chatGlassStyle"
      class="flex h-[32rem] flex-col rounded-[var(--agent-replay-radius,1.75rem)] border border-[color:var(--color-border)]"
    >
      <ChatThread class="[mask-image:linear-gradient(to_bottom,transparent,#000_2rem)]">
        <ChatMessage v-if="shown > 0 && prompt" role="user">{{ prompt.text }}</ChatMessage>
        <ChatMessage v-if="replying" role="assistant" :text="answer?.kind === 'answer' ? answer.text : ''" :streaming="!answer || answering">
          <template v-if="steps.length" #before>
            <template v-for="step in steps" :key="step.i">
              <ChatTool
                :label="step.label"
                :state="step.state"
                :icon="step.event.icon"
                :open="isOpen(step)"
                @update:open="setOpen(step.i, $event)"
              >
                <!-- A subagent's own session: its steps on a thread, and what it hands back. -->
                <div v-if="step.event.session" class="ml-[7px] border-l border-[color:color-mix(in_oklab,var(--color-fg)_12%,transparent)] pl-4">
                  <template v-for="(inner, n) in sessionOf(step)" :key="n">
                    <ChatTool
                      v-if="inner.kind === 'step'"
                      :label="innerRunning(step, n) ? inner.running : inner.done"
                      :state="innerRunning(step, n) ? 'running' : 'done'"
                      :icon="inner.icon"
                      class="mb-2"
                    />
                    <p v-else class="animate-blur-in text-sm text-fg-secondary motion-reduce:animate-none">{{ inner.text }}</p>
                  </template>
                </div>
                <CodeDiff v-else-if="step.event.diff" v-bind="step.event.diff" class="mt-1" />
                <CodeBlock v-else-if="step.event.output" :code="step.event.output" wrap class="mt-1" />
              </ChatTool>
              <!-- Asking: your answer, or the script's after a moment. -->
              <div v-if="isLast(step.i) && phase === 'asking'" class="mb-3 ml-6 flex animate-blur-in gap-2 motion-reduce:animate-none">
                <Button size="sm" variant="outline" @click="decide('allowed')">{{ labels.allow }}</Button>
                <Button size="sm" variant="ghost" @click="decide('denied')">{{ labels.deny }}</Button>
              </div>
            </template>
          </template>
        </ChatMessage>
        <CodeBlock
          v-if="answer?.kind === 'answer' && answer.code && !answering"
          :code="answer.code.code"
          :title="answer.code.file"
          wrap
          class="animate-blur-in motion-reduce:animate-none"
        />
      </ChatThread>
    </Aurora>

    <!-- What to notice, one note per moment, with the controls. -->
    <div :class="['flex flex-col justify-between', layout === 'stacked' ? 'gap-3' : 'gap-6 lg:py-4']">
      <div aria-live="polite" :class="layout === 'stacked' ? 'min-h-14' : 'min-h-24'">
        <Transition
          mode="out-in"
          enter-active-class="animate-blur-in motion-reduce:animate-none"
          leave-active-class="transition-opacity duration-150"
          leave-to-class="opacity-0"
        >
          <!-- The last note is what the session was for: once it has played, it stands out. -->
          <p
            v-if="note"
            :key="`${shown}-${events.length}-${note}-${finished}`"
            :class="['text-base leading-relaxed', finished ? 'font-medium text-fg' : 'text-fg-secondary']"
          >
            {{ note }}
          </p>
        </Transition>
      </div>
      <div class="flex items-center gap-1">
        <button type="button" :class="controlClass" :aria-label="playing ? labels.pause : labels.play" @click="playing ? pause() : play()">
          <component :is="playing ? PauseIcon : PlayIcon" class="size-4" aria-hidden="true" />
        </button>
        <button type="button" :class="controlClass" :aria-label="labels.previous" :disabled="shown <= (events[0]?.kind === 'prompt' ? 1 : 0)" @click="previous">
          <ChevronLeftIcon class="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          :class="controlClass"
          :aria-label="labels.next"
          :disabled="shown >= events.length && phase === 'settled'"
          @click="next"
        >
          <ChevronRightIcon class="size-4" aria-hidden="true" />
        </button>
        <button type="button" :class="controlClass" :aria-label="labels.restart" @click="restart">
          <ReplayIcon class="size-4" aria-hidden="true" />
        </button>
        <TextMorph class="ml-2 text-xs text-fg-muted tabular-nums" :text="counter" />
      </div>
    </div>
  </div>
</template>
