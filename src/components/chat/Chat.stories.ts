import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Globe } from '@lucide/vue'
import { ref } from 'vue'
import Chat from './Chat.vue'
import ChatComposer from './ChatComposer.vue'
import ChatMessage from './ChatMessage.vue'
import ChatThread from './ChatThread.vue'
import { fakeModel, REPLIES, SOURCES } from './chat.fixtures'
import ChatSource from './ChatSource.vue'
import ChatSources from './ChatSources.vue'
import ChatTool from './ChatTool.vue'
import ChatToolDetail from './ChatToolDetail.vue'

// The chat both stories run, with a model that answers as it streams (see chat.fixtures).
const chat = (options?: { searchFails?: boolean; answerFails?: boolean; failsMidway?: boolean; long?: boolean }) => ({
  components: { Chat, ChatComposer, ChatMessage, ChatSource, ChatSources, ChatThread, ChatTool, ChatToolDetail },
  setup: () => ({
    ...fakeModel(
      [
        { role: 'user', text: 'What is a harness?' },
        { role: 'assistant', text: REPLIES[0]!, tool: { label: `Read ${SOURCES.length} sources`, state: 'done', sources: SOURCES } },
      ],
      options,
    ),
    Globe,
  }),
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
 * A long answer: your message glides to the top, and once the answer reaches the bottom the view
 * follows it down, gliding at the pace the text comes. Scroll up to reread and it lets go, with a
 * button back to the end.
 */
export const LongAnswer: Story = {
  render: () => chat({ long: true }),
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
