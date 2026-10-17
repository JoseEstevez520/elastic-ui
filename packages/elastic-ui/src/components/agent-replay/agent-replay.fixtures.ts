// For the stories only: sessions with a coding agent, shared by AgentReplay's stories and the
// Article's.
import { FileText, FlaskConical, PencilLine, Search } from '@lucide/vue'
import { AFTER, BEFORE } from '../code-diff/code-diff.fixtures'
import type { AgentReplayEvent } from './agent-replay.types'

export const events: AgentReplayEvent[] = [
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
export const MODEL_ONLY: AgentReplayEvent[] = [
  prompt('The same request, to a model on its own: a chat, such as ChatGPT or Claude on the web.'),
  {
    kind: 'answer',
    text: 'You can check the title before saving the task. Replace your POST /tasks route with this one:',
    code: { file: 'server.js', code: PATCH },
    note: 'It answers with text. It has never seen your project, so it guesses how it looks, and copying, pasting and running it is up to you.',
  },
]
export const WITH_HARNESS: AgentReplayEvent[] = [
  prompt('The same request, to the same model with a harness: tools, instructions and permissions to work in your project.'),
  events[1]!,
  events[2]!,
  events[3]!,
  events[4]!,
  { ...(events[5] as AgentReplayEvent), note: 'The model is the same; the harness is what let it search, read, edit and test your project itself. That is an agent.' },
]
// OpenCode's two agents, and one of your own that may not edit.
const EDIT = { kind: 'step', icon: PencilLine, diff: { file: 'server.js', before: BEFORE, after: AFTER } } as const
const READ = events[2]!
export const AGENTS: Record<string, AgentReplayEvent[]> = {
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
