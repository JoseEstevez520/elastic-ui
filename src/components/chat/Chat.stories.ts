import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Chat from './Chat.vue'
import ChatComposer from './ChatComposer.vue'
import ChatMessage from './ChatMessage.vue'
import ChatThread from './ChatThread.vue'

interface Message {
  id: number
  role: 'user' | 'assistant'
  text: string
}

const LONG =
  'A harness is the part of a coding agent that gives the model something to work with. The model on its own only reads and writes text; the harness turns that into actions. It reads the files in your project and passes them to the model, applies the edits the model asks for, runs the commands it proposes and shows it what they printed.\n\nThat loop, reading, deciding and acting, is what makes it feel like working with someone rather than asking a search box. The better the harness, the more of your project the model can see and the safer its actions are.'

const REPLIES = [
  LONG,
  'A harness is what gives a model its hands: it reads your project, edits files and runs commands.\n\nThen it shows the model what happened, so it can decide the next step.',
  'Start small: ask it to explain one file.\n\nThen ask it to change one function. You will see how it plans before it acts.\n\nOnce that feels natural, give it a whole task.',
  'Sure. Open the terminal in your project and run it from there, so it can see your files.',
]

const meta = {
  title: 'Special/Chat',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { Chat, ChatComposer, ChatMessage, ChatThread },
    setup() {
      let id = 1
      const messages = ref<Message[]>([
        { id: id++, role: 'user', text: 'What is a harness?' },
        { id: id++, role: 'assistant', text: REPLIES[0]! },
      ])
      const responding = ref(false)
      const streamingId = ref<number>()
      const status = ref<string>()
      // Streams a reply in a few words at a time, as a model would.
      let stream: ReturnType<typeof setTimeout> | undefined
      const send = (text: string) => {
        messages.value.push({ id: id++, role: 'user', text })
        responding.value = true
        const words = REPLIES[id % REPLIES.length]!.split(' ')
        messages.value.push({ id: id++, role: 'assistant', text: '' })
        const live = messages.value.at(-1)!
        streamingId.value = live.id

        // What it does before writing, one line morphing from step to step.
        status.value = 'Thinking'
        stream = setTimeout(() => {
          status.value = 'Searching the web'
          stream = setTimeout(() => {
            status.value = 'Reading 3 sources'
            stream = setTimeout(answer, 1100)
          }, 1100)
        }, 1100)

        // The answer, in bursts of uneven size at uneven times, at a model's pace (a few
        // hundred characters a second), with the odd longer pause.
        const answer = () => {
          live.text += (live.text ? ' ' : '') + words.splice(0, 2 + Math.floor(Math.random() * 7)).join(' ')
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
      return { messages, responding, streamingId, status, send, stop }
    },
    template: `
      <Chat class="h-screen">
        <ChatThread>
          <ChatMessage
            v-for="m in messages"
            :key="m.id"
            :role="m.role"
            :text="m.role === 'assistant' ? m.text : undefined"
            :streaming="m.id === streamingId"
            :status="status"
          >{{ m.text }}</ChatMessage>
        </ChatThread>
        <ChatComposer :responding="responding" @send="send" @stop="stop" />
      </Chat>`,
  }),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * Send a message: send turns into stop, and one line says what the answer is doing ("Thinking…"
 * → "Searching the web…"), morphing from step to step under a soft sheen. Then the answer flows
 * in as a wave however unevenly it arrives. Your own message just shows.
 */
export const Default: Story = {}

/** An answer arriving whole flows in as the same wave. */
export const WholeAnswer: Story = {
  render: () => ({
    components: { Chat, ChatComposer, ChatMessage, ChatThread },
    setup() {
      const answer = ref('')
      const ask = () => (answer.value = answer.value ? '' : REPLIES[1]!)
      return { answer, ask }
    },
    template: `
      <Chat class="h-screen">
        <ChatThread>
          <ChatMessage role="user">How should I start?</ChatMessage>
          <ChatMessage v-if="answer" role="assistant" :text="answer" />
        </ChatThread>
        <div class="mx-auto pb-5"><button type="button" class="text-sm text-accent" @click="ask">{{ answer ? 'Clear' : 'Answer' }}</button></div>
      </Chat>`,
  }),
}
