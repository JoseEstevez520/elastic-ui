import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TruncatedText from './TruncatedText.vue'

const meta = {
  title: 'Text/TruncatedText',
  component: TruncatedText,
  render: (args) => ({
    components: { TruncatedText },
    setup: () => ({ args }),
    template: `<TruncatedText v-bind="args" class="w-64 text-ui text-fg">Networks and routing</TruncatedText>`,
  }),
} satisfies Meta<typeof TruncatedText>

export default meta
type Story = StoryObj<typeof meta>

/** A line that fits keeps every letter: no fading edge. */
export const Fits: Story = {}

/** Too long for its box: it ends in a fading edge. */
export const RunsPast: Story = {
  render: () => ({
    components: { TruncatedText },
    template: `
      <TruncatedText class="w-64 text-ui text-fg">
        Unit 3 · Networks and routing: subnetting, static routes and the first look at OSPF
      </TruncatedText>`,
  }),
}

/** In a flex row it takes `min-w-0` to shrink; the date beside it stays whole. */
export const InARow: Story = {
  render: () => ({
    components: { TruncatedText },
    template: `
      <div class="flex w-80 resize-x items-baseline gap-3 overflow-hidden text-ui">
        <TruncatedText class="min-w-0 text-fg">Practice 4 · Deploying the API behind a reverse proxy</TruncatedText>
        <span class="ml-auto shrink-0 text-meta text-fg-muted tabular-nums">12 Mar</span>
      </div>`,
  }),
}

/** A list where each row measures itself: only the rows that run past fade. */
export const InAList: Story = {
  render: () => ({
    components: { TruncatedText },
    setup: () => ({
      rows: [
        'Notes',
        'Unit 3 · Networks and routing',
        'Unit 4 · Deployment with containers, a reverse proxy and a certificate',
        'Exams',
        'Practice 2 · Writing a small REST API with authentication and tests',
      ],
    }),
    template: `
      <ul class="flex w-72 flex-col gap-2 text-ui text-fg">
        <li v-for="row in rows" :key="row"><TruncatedText>{{ row }}</TruncatedText></li>
      </ul>`,
  }),
}
