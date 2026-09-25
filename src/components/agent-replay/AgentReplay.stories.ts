import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Bot, FileText, FlaskConical, PencilLine, Search } from '@lucide/vue'
import { AFTER, BEFORE } from '../code-diff/code-diff.fixtures'
import AgentReplay from './AgentReplay.vue'
import type { AgentReplayEvent } from './agent-replay.types'

const events: AgentReplayEvent[] = [
  {
    kind: 'prompt',
    text: "Don't let anyone create a task without a title.",
    note: 'You ask in plain words, as you would a colleague. The agent has not seen the code yet.',
  },
  {
    kind: 'step',
    running: 'Searching for the tasks route',
    done: 'Found POST /tasks in server.js',
    icon: Search,
    output: `server.js:13  app.post('/tasks', (req, res) => {`,
    note: 'First it looks for where tasks are created. The harness runs the search; the model only asked for it.',
  },
  {
    kind: 'step',
    running: 'Reading server.js',
    done: 'Read server.js',
    icon: FileText,
    output: BEFORE,
    note: 'It reads the whole file before touching anything, to see how the rest of the API answers.',
  },
  {
    kind: 'step',
    running: 'Editing server.js',
    done: 'Edited server.js',
    icon: PencilLine,
    diff: { file: 'server.js', before: BEFORE, after: AFTER },
    duration: 1800,
    note: 'The edit: a check for the title, a 400 when it is missing, and a 201 for a task created. Nothing else in the file moves.',
  },
  {
    kind: 'step',
    running: 'Running npm test',
    done: 'Ran npm test: 6 passed',
    icon: FlaskConical,
    output: `> tasks-api@1.0.0 test
> node --test

✔ lists the tasks
✔ creates a task
✔ rejects a task without a title
✔ rejects a blank title
✔ deletes a task
✔ answers 404 for an unknown task

6 passed`,
    note: 'Then it checks its own work: it runs the tests and reads what they printed.',
  },
  {
    kind: 'answer',
    text: 'Done. POST /tasks now answers 400 with an error when the title is missing or blank, and 201 when the task is created. The tests pass, including two new cases for the missing title.',
    note: 'Last, it tells you what it changed and how it knows it works. Read, act, check, report: that loop is what makes it an agent.',
  },
]

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

const ASK = "Don't let anyone create a task without a title."
const prompt = (note: string): AgentReplayEvent => ({ kind: 'prompt', text: ASK, note })

const PATCH = `app.post('/tasks', (req, res) => {
  const title = req.body.title?.trim()
  if (!title) return res.status(400).json({ error: 'A task needs a title' })

  const task = { id: tasks.length + 1, title }
  tasks.push(task)
  res.status(201).json(task)
})`

// The same request to a model alone, and to the model with a harness around it.
const MODEL_ONLY: AgentReplayEvent[] = [
  prompt('The same request, to a model on its own: a chat, such as ChatGPT or Claude on the web.'),
  {
    kind: 'answer',
    text: 'You can check the title before saving the task. Replace your POST /tasks route with this one:',
    code: { file: 'server.js', code: PATCH },
    note: 'It answers with text. It has never seen your project, so it guesses how it looks, and copying, pasting and running it is up to you.',
  },
]
const WITH_HARNESS: AgentReplayEvent[] = [
  prompt('The same request, to the same model with a harness: tools, instructions and permissions to work in your project.'),
  events[1]!,
  events[2]!,
  events[3]!,
  events[4]!,
  { ...(events[5] as AgentReplayEvent), note: 'The model is the same; the harness is what let it search, read, edit and test your project itself. That is an agent.' },
]

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

// OpenCode's two agents, and one of your own that may not edit.
const EDIT = { kind: 'step', icon: PencilLine, diff: { file: 'server.js', before: BEFORE, after: AFTER } } as const
const READ = events[2]!
const AGENTS: Record<string, AgentReplayEvent[]> = {
  build: [
    prompt('Build is the agent OpenCode starts with. It does what you ask.'),
    READ,
    { ...EDIT, running: 'Editing server.js', done: 'Edited server.js', note: 'Build may edit and run commands without asking.' },
    { kind: 'answer', text: 'Done: POST /tasks now answers 400 when the title is missing.', note: 'Switch agents in OpenCode with Tab.' },
  ],
  plan: [
    prompt('Plan is for thinking before a big change. It tells you what it would do.'),
    READ,
    {
      ...EDIT,
      running: 'Editing server.js',
      asking: 'Wants to edit server.js',
      done: 'Not edited: you said no',
      permission: 'ask-deny',
      note: 'Before editing or running anything, Plan asks you. Here you say no: you only wanted the plan.',
    },
    {
      kind: 'answer',
      text: 'Plan: read the title in POST /tasks, trim it, answer 400 if it is empty, and 201 once the task is saved. Switch to Build to make the change.',
      note: 'It leaves you a plan to review, and changes nothing.',
    },
  ],
  tutor: [
    prompt('tutor is an agent of your own: your instructions, your permissions. This one may not edit.'),
    READ,
    {
      ...EDIT,
      running: 'Editing server.js',
      done: 'Denied: tutor may not edit',
      permission: 'deny',
      note: 'Its permissions say edit: deny, so the harness refuses the edit even if the model tries.',
    },
    {
      kind: 'answer',
      text: 'I can’t change the file, but you can. Where in POST /tasks would you check that the title is there? What should the API answer when it isn’t?',
      note: 'Its instructions say to guide, not to solve: it asks you questions instead of writing the code.',
    },
  ],
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
