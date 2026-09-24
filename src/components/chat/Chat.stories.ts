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

const meta = {
  title: 'Special/Chat',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { Chat, ChatComposer, ChatMessage, ChatSource, ChatSources, ChatThread, ChatTool },
    setup: () => ({
      ...fakeModel([
        { role: 'user', text: 'What is a harness?' },
        { role: 'assistant', text: REPLIES[0]!, tool: { label: `Read ${SOURCES.length} sources`, state: 'done', sources: SOURCES } },
      ]),
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
          >
            <template v-if="m.tool" #before>
              <ChatTool :label="m.tool.label" :state="m.tool.state" :icon="Globe">
                <ChatSources><ChatSource v-for="s in m.tool.sources" :key="s.url" v-bind="s" /></ChatSources>
              </ChatTool>
            </template>
            <template v-if="m.role === 'user'">{{ m.text }}</template>
          </ChatMessage>
        </ChatThread>
        <ChatComposer :responding="responding" @send="send" @stop="stop" />
      </Chat>`,
  }),
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

