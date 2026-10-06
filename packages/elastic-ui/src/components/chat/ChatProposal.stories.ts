import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { FolderInput, Globe, StickyNote, Trash2 } from '@lucide/vue'
import { ref } from 'vue'
import Chat from './Chat.vue'
import ChatMessage from './ChatMessage.vue'
import ChatProposal from './ChatProposal.vue'
import ChatThread from './ChatThread.vue'
import ChatTool from './ChatTool.vue'
import ChatToolDetail from './ChatToolDetail.vue'

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

type State = 'proposed' | 'working' | 'done' | 'error' | 'cancelled'

const NOTE = {
  title: 'Cache invalidation',
  body: 'Stale reads come from the CDN, not the database. Purge by tag on every publish.',
}

/** What a proposal does when confirmed: it works for a moment, then it is done (or fails). */
function useProposal(fails = false) {
  const state = ref<State>('proposed')
  const editing = ref(false)
  const open = ref(false)
  const confirm = async () => {
    state.value = 'working'
    await wait(1400)
    state.value = fails ? 'error' : 'done'
    open.value = true
  }
  const cancel = () => (state.value = 'cancelled')
  return { state, editing, open, confirm, cancel }
}

const meta = {
  title: 'AI/ChatProposal',
  component: ChatProposal,
  parameters: { layout: 'padded' },
  args: { label: 'Add a note to "Caching"', icon: StickyNote, args: NOTE },
} satisfies Meta<typeof ChatProposal>

export default meta
type Story = StoryObj<typeof meta>

/**
 * What an answer proposes instead of doing: a line saying what would happen, and the details it
 * would do it with. Confirm: it works for a moment and comes back done, with its result under it,
 * which opens and closes. Cancel and it is left as cancelled, quietly, as a line that stays in the conversation. Edit opens
 * the details as fields to change before confirming. Nothing happens until Confirm is pressed.
 */
export const Default: Story = {
  render: (args) => ({
    components: { ChatProposal, ChatToolDetail },
    setup: () => ({ args, ...useProposal() }),
    template: `
      <div class="max-w-xl">
        <ChatProposal
          v-bind="args"
          v-model:editing="editing"
          v-model:open="open"
          :state="state"
          @confirm="confirm"
          @cancel="cancel"
        >
          <ChatToolDetail>Note saved in Caching, under "Cache invalidation".</ChatToolDetail>
        </ChatProposal>
      </div>`,
  }),
}

/** The five states, side by side and still: waiting for a decision, working, done, failed and cancelled. */
export const AllStates: Story = {
  render: (args) => ({
    components: { ChatProposal, ChatToolDetail },
    setup: () => ({ args }),
    template: `
      <div class="flex max-w-xl flex-col gap-8">
        <ChatProposal v-bind="args" state="proposed" />
        <ChatProposal v-bind="args" state="working" />
        <ChatProposal v-bind="args" state="done" :open="true">
          <ChatToolDetail>Note saved in Caching, under "Cache invalidation".</ChatToolDetail>
        </ChatProposal>
        <ChatProposal v-bind="args" state="error" :open="true">
          <ChatToolDetail error>The note was not saved: you can no longer edit this page.</ChatToolDetail>
        </ChatProposal>
        <ChatProposal v-bind="args" state="cancelled" />
      </div>`,
  }),
}

/**
 * Something that cannot be taken back, such as deleting a page. Confirm does not go through at once:
 * it asks again, in the danger colour, and only the second press goes ahead.
 */
export const Destructive: Story = {
  args: {
    label: 'Delete the page "Old caching notes"',
    icon: Trash2,
    destructive: true,
    args: { page: 'Caching / Old caching notes', notes: 4 },
  },
  render: (args) => ({
    components: { ChatProposal, ChatToolDetail },
    setup: () => ({ args, ...useProposal() }),
    template: `
      <div class="max-w-xl">
        <ChatProposal v-bind="args" v-model:editing="editing" v-model:open="open" :state="state" @confirm="confirm" @cancel="cancel">
          <ChatToolDetail>Page deleted, with its 4 notes.</ChatToolDetail>
        </ChatProposal>
      </div>`,
  }),
}

/**
 * Open in edit mode: each detail takes the field its value asks for. A string is a line, a long
 * one a text area, a number a number field, a boolean a switch, and an object, which has no field
 * of its own, is edited as JSON.
 */
export const Editing: Story = {
  args: {
    label: 'Add a note to "Caching"',
    icon: StickyNote,
    args: {
      title: 'Cache invalidation',
      body: 'Stale reads come from the CDN, not the database.\nPurge by tag on every publish, and never by URL.',
      position: 3,
      pinned: true,
      meta: { source: 'chat', tags: ['cdn', 'cache'] },
    },
  },
  render: (args) => ({
    components: { ChatProposal },
    setup: () => {
      const proposal = useProposal()
      proposal.editing.value = true
      return { args, ...proposal }
    },
    template: `
      <div class="max-w-xl">
        <ChatProposal v-bind="args" v-model:editing="editing" :state="state" @confirm="confirm" @cancel="cancel" />
      </div>`,
  }),
}

/**
 * Long content: a label that runs over several lines, a long multiline detail and many details at
 * once. The line wraps beside its icon, the actions stay within reach, and the details never push
 * the proposal wider than its column.
 */
export const LongContent: Story = {
  args: {
    label:
      'Move the page "Everything we learned about how the harness reads, decides and acts across the whole of the second unit" into "Unit 2 / Agents / Going deeper"',
    icon: FolderInput,
    args: {
      page: 'Everything we learned about how the harness reads, decides and acts across the whole of the second unit',
      destination: 'Unit 2 / Agents / Going deeper / Reading material for the weeks before the exam',
      reason:
        'The page is about agents, not about the harness alone, and the second unit is where the class keeps them.\n\nIt was written during the first week, when the tree had no place for it, and three notes link to it from Unit 2, so keeping it apart makes those links hard to follow. Moving it also keeps the history of its edits.',
      keepRedirect: true,
      position: 2,
      notify: 'Everyone who edited it',
      reviewer: 'Maria Soto',
      deadline: '2026-11-02',
    },
  },
  render: (args) => ({
    components: { ChatProposal },
    setup: () => ({ args, ...useProposal() }),
    template: `
      <div class="max-w-md">
        <ChatProposal v-bind="args" v-model:editing="editing" :state="state" @confirm="confirm" @cancel="cancel" />
      </div>`,
  }),
}

/**
 * Where it lives: under an answer, in the message's `after` slot, one for each thing the answer proposes.
 * Here one is an admin move and the other a note; each is decided on its own. The step that read the
 * pages goes before the answer. Resize to a phone's width: the proposals take the column and the
 * actions stay on screen.
 */
export const InAConversation: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { Chat, ChatMessage, ChatProposal, ChatThread, ChatTool, ChatToolDetail },
    setup: () => ({
      move: useProposal(),
      note: useProposal(),
      Globe,
      FolderInput,
      StickyNote,
      moveArgs: { page: 'Caching basics', destination: 'Unit 3 / Performance' },
      noteArgs: NOTE,
    }),
    template: `
      <Chat class="h-screen">
        <ChatThread>
          <ChatMessage role="user">The caching notes are scattered. Can you tidy them up and write down what we decided about the CDN?</ChatMessage>
          <ChatMessage
            role="assistant"
            text="Two things would help. &quot;Caching basics&quot; sits in Unit 1, but it is about performance, which is Unit 3. And the CDN decision is in the chat but not in the notes yet."
          >
            <template #before>
              <ChatTool label="Read 4 pages" state="done" :icon="Globe">
                <ChatToolDetail>Caching basics, Unit 3 overview, CDN setup, Weekly summary.</ChatToolDetail>
              </ChatTool>
            </template>
            <template #after>
              <ChatProposal
                label="Move &quot;Caching basics&quot; into Unit 3 / Performance"
                :icon="FolderInput"
                :args="moveArgs"
                v-model:editing="move.editing.value"
                v-model:open="move.open.value"
                :state="move.state.value"
                @confirm="move.confirm"
                @cancel="move.cancel"
              >
                <ChatToolDetail>Moved to Unit 3 / Performance.</ChatToolDetail>
              </ChatProposal>
              <ChatProposal
                label="Add a note to &quot;CDN setup&quot;"
                :icon="StickyNote"
                :args="noteArgs"
                v-model:editing="note.editing.value"
                v-model:open="note.open.value"
                :state="note.state.value"
                @confirm="note.confirm"
                @cancel="note.cancel"
              >
                <ChatToolDetail>Note saved in CDN setup.</ChatToolDetail>
              </ChatProposal>
            </template>
          </ChatMessage>
        </ChatThread>
      </Chat>`,
  }),
}

/** Two on the same page at once: each keeps its own state, and deciding one leaves the other as it was. */
export const TwoInstances: Story = {
  render: (args) => ({
    components: { ChatProposal, ChatToolDetail },
    setup: () => ({ args, a: useProposal(), b: useProposal() }),
    template: `
      <div class="flex max-w-xl flex-col gap-8">
        <ChatProposal v-bind="args" v-model:editing="a.editing.value" v-model:open="a.open.value" :state="a.state.value" @confirm="a.confirm" @cancel="a.cancel">
          <ChatToolDetail>Note saved in Caching.</ChatToolDetail>
        </ChatProposal>
        <ChatProposal
          v-bind="args"
          label="Add a note to &quot;CDN setup&quot;"
          :args="{ title: 'Purge by tag', body: 'Purge by tag on every publish.' }"
          v-model:editing="b.editing.value"
          v-model:open="b.open.value"
          :state="b.state.value"
          @confirm="b.confirm"
          @cancel="b.cancel"
        >
          <ChatToolDetail>Note saved in CDN setup.</ChatToolDetail>
        </ChatProposal>
      </div>`,
  }),
}

/**
 * It was confirmed and failed: the reason shows under it, in the danger colour, and the actions
 * come back so it can be tried again, or changed first with Edit.
 */
export const Failing: Story = {
  render: (args) => ({
    components: { ChatProposal, ChatToolDetail },
    setup: () => {
      const proposal = useProposal(true)
      proposal.state.value = 'error'
      proposal.open.value = true
      return { args, ...proposal }
    },
    template: `
      <div class="max-w-xl">
        <ChatProposal v-bind="args" v-model:editing="editing" v-model:open="open" :state="state" @confirm="confirm" @cancel="cancel">
          <ChatToolDetail error>The note was not saved: the page "Caching" was deleted while you were deciding.</ChatToolDetail>
        </ChatProposal>
      </div>`,
  }),
}
