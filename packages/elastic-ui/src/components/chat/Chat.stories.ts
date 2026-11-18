import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Globe } from '@lucide/vue'
import { onBeforeUnmount, ref } from 'vue'
import { setStreamEffect } from '../../utils/streamPace'
import Chat from './Chat.vue'
import ChatComposer from './ChatComposer.vue'
import ChatMessage from './ChatMessage.vue'
import ChatThread from './ChatThread.vue'
import { fakeModel, REPLIES, SOURCES, type Message } from './chat.fixtures'
import ChatSource from './ChatSource.vue'
import ChatSources from './ChatSources.vue'
import ChatTool from './ChatTool.vue'
import ChatToolDetail from './ChatToolDetail.vue'

// The chat both stories run, with a model that answers as it streams (see chat.fixtures).
const FIRST: Omit<Message, 'id'>[] = [
  { role: 'user', text: 'What is a harness?' },
  { role: 'assistant', text: REPLIES[0]!, tool: { label: `Read ${SOURCES.length} sources`, state: 'done', sources: SOURCES } },
]
const chat = (
  options?: { searchFails?: boolean; answerFails?: boolean; failsMidway?: boolean; long?: boolean },
  start: Omit<Message, 'id'>[] = FIRST,
) => ({
  components: { Chat, ChatComposer, ChatMessage, ChatSource, ChatSources, ChatThread, ChatTool, ChatToolDetail },
  setup: () => ({ ...fakeModel(start, options), Globe }),
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
          :error="m.error"
        >
          <template v-if="m.tool" #before>
            <ChatTool :label="m.tool.label" :state="m.tool.state" :icon="Globe">
              <ChatSources v-if="m.tool.sources.length"><ChatSource v-for="s in m.tool.sources" :key="s.url" v-bind="s" /></ChatSources>
              <ChatToolDetail v-else error>{{ m.tool.detail }}</ChatToolDetail>
            </ChatTool>
          </template>
          <template v-if="m.role === 'user'">{{ m.text }}</template>
        </ChatMessage>
      </ChatThread>
      <ChatComposer :responding="responding" @send="send" @stop="stop" />
    </Chat>`,
})

const meta = {
  title: 'AI/Chat',
  parameters: { layout: 'fullscreen' },
  render: () => chat(),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * Send a message: send turns into stop, and one line says it is thinking. Then it searches: a step
 * shimmering "Searching the web", whose words morph into "Read 3 sources" once done; click it to
 * open the sources as a wave. Then the answer flows
 * in as a wave however unevenly it arrives. Your own message just shows.
 */
export const Default: Story = {}

/**
 * A long answer: your message glides to the top and the view holds there while the answer grows
 * below, never following it, so it is read from its first line. While more is below, a button
 * takes you to the end, once. Scrolling up lets the message go, and the room under it goes too,
 * out of sight. Send a short question after it: the short answer leaves the room below it, still,
 * until you scroll up.
 */
export const LongAnswer: Story = {
  render: () => chat({ long: true }),
}

/**
 * In ink (`setStreamEffect('ink')`): the same front of words coming into focus, but each lands in
 * the aurora's colours, drifting from one to the next along the text, and dries into the text's
 * own. Send a message.
 */
export const InkStream: Story = {
  render: () => {
    const base = chat({ long: true })
    return {
      ...base,
      setup(...args: unknown[]) {
        setStreamEffect('ink')
        onBeforeUnmount(() => setStreamEffect('wave'))
        return (base.setup as (...a: unknown[]) => object)(...args)
      },
    }
  },
}

/**
 * An empty thread: the first message already sits in the upper half of the view, so nothing moves;
 * the answer grows below it, out past the end, and the button offers the way down.
 */
export const FromEmpty: Story = {
  render: () => chat({ long: true }, []),
}

/**
 * A long message of yours: only its end stays at the top, so the answer still has most of the view.
 */
export const LongQuestion: Story = {
  render: () => ({
    ...chat(),
    setup() {
      const model = fakeModel(FIRST)
      const question = Array.from({ length: 6 }, () => SOURCES.map((s) => s.title).join('. ')).join('\n\n')
      return { ...model, Globe, send: () => model.send(question) }
    },
  }),
}

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

/**
 * The search fails, but the answer comes all the same, from what the model knows: no failure for
 * whoever reads it. The step says so quietly, and opens to tell what went wrong.
 */
export const SearchFails: Story = {
  render: () => chat({ searchFails: true }),
}

/** The answer fails: the thinking line turns into what went wrong, in the danger colour, and no text comes. */
export const AnswerFails: Story = {
  render: () => chat({ answerFails: true }),
}

/** The answer fails once some words have come: they stay, and what went wrong comes below them. */
export const FailsMidway: Story = {
  render: () => chat({ failsMidway: true }),
}
