import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ChatComposer from '../chat/ChatComposer.vue'
import ChatMessage from '../chat/ChatMessage.vue'
import ChatThread from '../chat/ChatThread.vue'
import { fakeModel } from '../chat/chat.fixtures'
import ChatMorph from './ChatMorph.vue'

const meta = {
  title: 'Special/ChatMorph',
  component: ChatMorph,
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { ChatComposer, ChatMessage, ChatMorph, ChatThread },
    setup: () => fakeModel([]),
    template: `
      <div class="min-h-screen p-10">
        <p class="max-w-md text-fg-secondary">A page of your app. The assistant waits at the bottom right.</p>
        <ChatMorph :settled="messages.length > 0" :activity="activity">
          <ChatThread v-if="messages.length">
            <ChatMessage
              v-for="m in messages"
              :key="m.id"
              :role="m.role"
              :text="m.role === 'assistant' ? m.text : undefined"
              :streaming="m.id === streamingId"
              :status="status"
            >{{ m.text }}</ChatMessage>
          </ChatThread>
          <p v-else class="flex flex-1 items-center justify-center px-6 text-center text-xl font-medium">What can I help with?</p>
          <ChatComposer :responding="responding" @send="send" @stop="stop" />
        </ChatMorph>
      </div>`,
  }),
} satisfies Meta<typeof ChatMorph>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The orb, a circle of aurora, grows into a chat box; the lights gather and hurry while it thinks, flow while it answers, and settle to a tint once it is done.
 * Escape, the cross or a click elsewhere folds it back into the circle, keeping the conversation.
 */
export const Default: Story = {}

/** Inline: it grows from where it sits in the page. */
export const Inline: Story = {
  render: () => ({
    components: { ChatComposer, ChatMessage, ChatMorph, ChatThread },
    setup: () => fakeModel([]),
    template: `
      <div class="min-h-screen p-10">
        <ChatMorph :floating="false" :settled="messages.length > 0" :activity="activity">
          <ChatThread v-if="messages.length">
            <ChatMessage
              v-for="m in messages"
              :key="m.id"
              :role="m.role"
              :text="m.role === 'assistant' ? m.text : undefined"
              :streaming="m.id === streamingId"
              :status="status"
            >{{ m.text }}</ChatMessage>
          </ChatThread>
          <p v-else class="flex flex-1 items-center justify-center px-6 text-center text-xl font-medium">What can I help with?</p>
          <ChatComposer :responding="responding" @send="send" @stop="stop" />
        </ChatMorph>
      </div>`,
  }),
}
