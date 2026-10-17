import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { Globe, Maximize2 } from '@lucide/vue'
import Tooltip from '../tooltip/Tooltip.vue'
import ChatComposer from '../chat/ChatComposer.vue'
import ChatMessage from '../chat/ChatMessage.vue'
import ChatSource from '../chat/ChatSource.vue'
import ChatSources from '../chat/ChatSources.vue'
import ChatThread from '../chat/ChatThread.vue'
import ChatTool from '../chat/ChatTool.vue'
import { fakeModel } from '../chat/chat.fixtures'
import ChatMorph from './ChatMorph.vue'
import { chatMorphActionClass } from './chat-morph.variants'

const meta = {
  title: 'AI/ChatMorph',
  component: ChatMorph,
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { ChatComposer, ChatMessage, ChatMorph, ChatSource, ChatSources, ChatThread, ChatTool },
    setup: () => ({ ...fakeModel([]), Globe }),
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
            >
              <template v-if="m.tool" #before>
                <ChatTool :label="m.tool.label" :state="m.tool.state" :icon="Globe">
                  <ChatSources><ChatSource v-for="s in m.tool.sources" :key="s.url" v-bind="s" /></ChatSources>
                </ChatTool>
              </template>
              <template v-if="m.role === 'user'">{{ m.text }}</template>
            </ChatMessage>
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
    components: { ChatComposer, ChatMessage, ChatMorph, ChatSource, ChatSources, ChatThread, ChatTool },
    setup: () => ({ ...fakeModel([]), Globe }),
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
            >
              <template v-if="m.tool" #before>
                <ChatTool :label="m.tool.label" :state="m.tool.state" :icon="Globe">
                  <ChatSources><ChatSource v-for="s in m.tool.sources" :key="s.url" v-bind="s" /></ChatSources>
                </ChatTool>
              </template>
              <template v-if="m.role === 'user'">{{ m.text }}</template>
            </ChatMessage>
          </ChatThread>
          <p v-else class="flex flex-1 items-center justify-center px-6 text-center text-xl font-medium">What can I help with?</p>
          <ChatComposer :responding="responding" @send="send" @stop="stop" />
        </ChatMorph>
      </div>`,
  }),
}

/** The `actions` slot: an icon action beside the cross, such as opening the conversation in full. It takes the corner's look, and a tooltip for its name. */
export const WithAction: Story = {
  render: () => ({
    components: { ChatComposer, ChatMessage, ChatMorph, ChatThread, Maximize2, Tooltip },
    setup: () => ({ ...fakeModel([]), Maximize2, chatMorphActionClass }),
    template: `
      <div class="min-h-screen p-10">
        <p class="max-w-md text-fg-secondary">A page of your app. The assistant waits at the bottom right.</p>
        <ChatMorph :settled="messages.length > 0" :activity="activity">
          <template #actions>
            <Tooltip content="Open in full">
              <button type="button" aria-label="Open in full" :class="chatMorphActionClass"><Maximize2 class="size-4" /></button>
            </Tooltip>
          </template>
          <ChatThread v-if="messages.length">
            <ChatMessage
              v-for="m in messages"
              :key="m.id"
              :role="m.role"
              :text="m.role === 'assistant' ? m.text : undefined"
              :streaming="m.id === streamingId"
              :status="status"
            >
              <template v-if="m.role === 'user'">{{ m.text }}</template>
            </ChatMessage>
          </ChatThread>
          <p v-else class="flex flex-1 items-center justify-center px-6 text-center text-xl font-medium">What can I help with?</p>
          <ChatComposer :responding="responding" @send="send" @stop="stop" />
        </ChatMorph>
      </div>`,
  }),
}

/**
 * The same box at a second size, a right-hand panel: anchored to the right edge, the full height, 44rem wide (`--chat-morph-wide-width`), leaving an app's sidebar uncovered, with a 40rem reading column inside. `v-model:size="wide"`. `resizable` adds the built-in button that toggles it (named by the labels `expand` and `collapse`); the surface animates between the two sizes. It opens straight at `wide` when `size` is set, and closing folds back to the orb.
 */
export const Wide: Story = {
  render: () => ({
    components: { ChatComposer, ChatMessage, ChatMorph, ChatThread },
    setup: () => ({ ...fakeModel([]), size: ref<'default' | 'wide'>('wide'), open: ref(true) }),
    template: `
      <div class="min-h-screen p-10">
        <p class="max-w-md text-fg-secondary">A page of your app. The assistant waits at the bottom right.</p>
        <ChatMorph v-model:open="open" v-model:size="size" resizable :settled="messages.length > 0" :activity="activity">
          <ChatThread v-if="messages.length">
            <ChatMessage
              v-for="m in messages"
              :key="m.id"
              :role="m.role"
              :text="m.role === 'assistant' ? m.text : undefined"
              :streaming="m.id === streamingId"
              :status="status"
            >
              <template v-if="m.role === 'user'">{{ m.text }}</template>
            </ChatMessage>
          </ChatThread>
          <p v-else class="flex flex-1 items-center justify-center px-6 text-center text-xl font-medium">What can I help with?</p>
          <ChatComposer :responding="responding" @send="send" @stop="stop" />
        </ChatMorph>
      </div>`,
  }),
}
