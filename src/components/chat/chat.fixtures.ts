// For the stories only: a model that streams its answers as a real one would.
import { computed, ref } from 'vue'

export interface Source {
  title: string
  url: string
}

export interface Message {
  id: number
  role: 'user' | 'assistant'
  text: string
  /** A search it ran before answering; failing, what went wrong. */
  tool?: { label: string; state: 'running' | 'done' | 'error'; sources: Source[]; detail?: string }
  /** The answer failed: what went wrong. */
  error?: string
}

export const SOURCES: Source[] = [
  { title: 'What a harness does for a coding agent', url: 'https://docs.example.com/agents/harness' },
  { title: 'Test harness', url: 'https://wiki.example.org/Test_harness' },
  { title: 'Reading, deciding, acting: the agent loop explained step by step', url: 'https://blog.example.dev/agent-loop' },
]

const LONG =
  'A harness is the part of a coding agent that gives the model something to work with. The model on its own only reads and writes text; the harness turns that into actions. It reads the files in your project and passes them to the model, applies the edits the model asks for, runs the commands it proposes and shows it what they printed.\n\nThat loop, reading, deciding and acting, is what makes it feel like working with someone rather than asking a search box. The better the harness, the more of your project the model can see and the safer its actions are.'

export const REPLIES = [
  LONG,
  'A harness is what gives a model its hands: it reads your project, edits files and runs commands.\n\nThen it shows the model what happened, so it can decide the next step.',
  'Start small: ask it to explain one file.\n\nThen ask it to change one function. You will see how it plans before it acts.\n\nOnce that feels natural, give it a whole task.',
  'Sure. Open the terminal in your project and run it from there, so it can see your files.',
]

/** An answer longer than the view, to see the view follow it down. */
export const LONG_REPLY = [
  'A harness is the part of a coding agent that gives the model something to work with, and it is worth taking apart piece by piece.',
  'First it reads. The model on its own sees nothing of your project: the harness lists the files, opens the ones that matter and passes their text along, trimmed to fit what the model can hold at once.',
  'Then it decides. With that in front of it, the model says what it wants to do next: read another file, change a function, run the tests. It only says so, in text; nothing has happened yet.',
  'Then it acts. The harness turns that text into the real thing: it applies the edit to the file, runs the command in your terminal and captures what it printed, errors included.',
  'And then it shows. What happened goes back to the model as the next thing it reads, so it can see whether the tests pass, fix what it broke and go on. That loop runs again and again until the task is done.',
  'The better the harness, the more of your project the model can see and the safer its actions are: it asks before running something risky, keeps a record of every change, and lets you undo any of them.',
  'So when an agent feels like working with someone rather than asking a search box, that feeling is mostly the harness: the model thinks, but the harness is what lets it look around and do things.',
].join('\n\n')

/**
 * A fake model: status steps, then the answer in uneven bursts, as a real one streams. With
 * `searchFails` its search goes wrong, and it answers from what it knows; with `answerFails` the
 * whole answer does, while it is still thinking, and with `failsMidway` once some words have come.
 * With `long` it answers at length.
 */
export function fakeModel(
  start: Omit<Message, 'id'>[],
  { searchFails = false, answerFails = false, failsMidway = false, long = false } = {},
) {
  let id = 1
  const messages = ref<Message[]>(start.map((m) => ({ ...m, id: id++ })))
  const responding = ref(false)
  const streamingId = ref<number>()
  const status = ref<string>()
  // Streams a reply in a few words at a time, as a model would.
  let stream: ReturnType<typeof setTimeout> | undefined
  const send = (text: string) => {
    messages.value.push({ id: id++, role: 'user', text })
    responding.value = true
    const words = (long ? LONG_REPLY : REPLIES[id % REPLIES.length]!).split(' ')
    messages.value.push({ id: id++, role: 'assistant', text: '' })
    const live = messages.value.at(-1)!
    streamingId.value = live.id

    // It thinks, then searches: one line saying so, which turns into what it found.
    status.value = 'Thinking'
    if (answerFails) {
      stream = setTimeout(() => {
        live.error = 'Something went wrong. Try again in a moment.'
        responding.value = false
        streamingId.value = undefined
      }, 1600)
      return
    }
    stream = setTimeout(() => {
      live.tool = { label: 'Searching the web', state: 'running', sources: SOURCES }
      stream = setTimeout(() => {
        live.tool = searchFails
          ? {
              ...live.tool!,
              label: "Couldn't search the web",
              state: 'error',
              sources: [],
              detail: "The search didn't answer in time, so this comes from what the model already knows.",
            }
          : { ...live.tool!, label: `Read ${SOURCES.length} sources`, state: 'done' }
        stream = setTimeout(answer, 700)
      }, 1800)
    }, 1100)

    // The answer, in bursts of uneven size at uneven times, at a model's pace (a few
    // hundred characters a second), with the odd longer pause.
    const answer = () => {
      live.text += (live.text ? ' ' : '') + words.splice(0, 2 + Math.floor(Math.random() * 7)).join(' ')
      if (failsMidway && live.text.length > 120) {
        live.error = 'The connection dropped. Try again in a moment.'
        words.length = 0
      }
      if (!words.length) {
        responding.value = false
        streamingId.value = undefined
        return
      }
      stream = setTimeout(answer, Math.random() < 0.1 ? 400 : 40 + Math.random() * 120)
    }
  }
  // Stopped before any text, the empty answer goes; stopped mid-way, what came stays.
  const stop = () => {
    clearTimeout(stream)
    responding.value = false
    messages.value = messages.value.filter((m) => m.role === 'user' || m.text || m.id !== streamingId.value)
    streamingId.value = undefined
  }
  // Thinking until the answer's first words, answering while they flow.
  const activity = computed(() => {
    if (!responding.value) return 'rest'
    return messages.value.find((m) => m.id === streamingId.value)?.text ? 'answering' : 'thinking'
  })
  return { messages, responding, streamingId, status, activity, send, stop }
}
