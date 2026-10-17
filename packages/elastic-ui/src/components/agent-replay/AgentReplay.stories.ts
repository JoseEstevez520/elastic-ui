import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Bot, FileText, Search } from '@lucide/vue'
import AgentReplay from './AgentReplay.vue'
import { AGENTS, events, MODEL_ONLY, WITH_HARNESS } from './agent-replay.fixtures'

const meta = {
  title: 'AI/AgentReplay',
  component: AgentReplay,
  parameters: { layout: 'fullscreen' },
  args: { events, intro: 'A session with a coding agent, played back step by step.' },
  render: (args) => ({
    components: { AgentReplay },
    setup: () => ({ args }),
    template: `<div class="mx-auto max-w-5xl px-6 py-16"><AgentReplay v-bind="args" /></div>`,
  }),
} satisfies Meta<typeof AgentReplay>

export default meta
type Story = StoryObj<typeof meta>

/**
 * It plays once in view: your request, then each step shimmering while it runs and turning into
 * what it did, the edit opening on its own, then the answer flowing in. A note beside each moment
 * says what to notice. Pause, and step back and forth.
 */
export const Default: Story = {}

/**
 * The same request, to a model alone and to the model with a harness, side by side: one answers
 * with code to paste, the other does the work.
 */
export const ModelOrAgent: Story = {
  render: () => ({
    components: { AgentReplay },
    setup: () => ({ MODEL_ONLY, WITH_HARNESS }),
    template: `
      <div class="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2">
        <section class="flex flex-col gap-4">
          <h2 class="text-lg font-semibold">Model only</h2>
          <AgentReplay :events="MODEL_ONLY" layout="stacked" />
        </section>
        <section class="flex flex-col gap-4">
          <h2 class="text-lg font-semibold">Model + harness</h2>
          <AgentReplay :events="WITH_HARNESS" layout="stacked" />
        </section>
      </div>`,
  }),
}

/**
 * The same request to OpenCode's Build and Plan, and to an agent of your own that may not edit,
 * one after the other, as chapters of a page.
 */
export const Agents: Story = {
  render: () => ({
    components: { AgentReplay },
    setup: () => ({ AGENTS }),
    template: `
      <div class="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-16">
        <section v-for="(title, key) in { build: 'Build', plan: 'Plan', tutor: 'An agent of your own: tutor' }" :key="key" class="flex flex-col gap-4">
          <h2 class="text-lg font-semibold">{{ title }}</h2>
          <AgentReplay :events="AGENTS[key]" />
        </section>
      </div>`,
  }),
}

/** A subagent: Build hands a search to Explore, which works on its own and hands back only its answer. */
export const Subagent: Story = {
  args: {
    events: [
      { kind: 'prompt', text: 'Where is the database configured?', note: 'A question that needs a look around the whole project.' },
      {
        kind: 'step',
        running: 'Asking Explore',
        done: 'Explore answered',
        icon: Bot,
        session: [
          { kind: 'step', running: 'Searching for "datasource"', done: 'Found 2 files', icon: Search },
          { kind: 'step', running: 'Reading application.properties', done: 'Read application.properties', icon: FileText },
          { kind: 'answer', text: 'In src/main/resources/application.properties, under spring.datasource.' },
        ],
        note: 'Build hands the search to Explore, a subagent that may only read. It works apart, in its own session.',
      },
      {
        kind: 'answer',
        text: 'In src/main/resources/application.properties: the spring.datasource.* keys set the URL, the user and the password.',
        note: 'Only Explore’s answer comes back, not everything it read, so Build’s own context stays small.',
      },
    ],
    intro: 'A subagent at work.',
  },
}
