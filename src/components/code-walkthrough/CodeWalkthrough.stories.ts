import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CodeWalkthrough from './CodeWalkthrough.vue'
import CodeWalkthroughStep from './CodeWalkthroughStep.vue'

const START = `import express from 'express'

const app = express()

app.listen(3000)`

const ROUTE = `import express from 'express'

const app = express()

const tasks = [
  { id: 1, title: 'Read the notes' },
  { id: 2, title: 'Do the practice' },
]

app.get('/tasks', (req, res) => {
  res.json(tasks)
})

app.listen(3000)`

const POST = `import express from 'express'

const app = express()
app.use(express.json())

const tasks = [
  { id: 1, title: 'Read the notes' },
  { id: 2, title: 'Do the practice' },
]

app.get('/tasks', (req, res) => {
  res.json(tasks)
})

app.post('/tasks', (req, res) => {
  const task = { id: tasks.length + 1, title: req.body.title }
  tasks.push(task)
  res.status(201).json(task)
})

app.listen(3000)`

const LISTEN = POST.replace(
  'app.listen(3000)',
  `const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(\`Listening on http://localhost:\${PORT}\`)
})`,
)

const meta = {
  title: 'Special/CodeWalkthrough',
  component: CodeWalkthrough,
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { CodeWalkthrough, CodeWalkthroughStep },
    setup: () => ({ START, ROUTE, POST, LISTEN }),
    template: `
      <div class="mx-auto max-w-6xl px-6 py-16">
        <h1 class="mb-3 text-3xl font-semibold">A tasks API with Express</h1>
        <p class="mb-16 max-w-xl text-fg-secondary">Four steps, from an empty server to one that lists and saves tasks. Scroll: the code on the right follows you.</p>
        <CodeWalkthrough>
          <CodeWalkthroughStep title="Start a server" file="server.js" :code="START">
            <p>Import Express, create the app and start listening on a port. It answers nothing yet: every request gets a 404.</p>
          </CodeWalkthroughStep>
          <CodeWalkthroughStep title="List the tasks" file="server.js" :code="ROUTE">
            <p>Keep the tasks in an array for now, and answer <code>GET /tasks</code> with them as JSON.</p>
            <p>The lines this step adds stand out; the rest steps back.</p>
          </CodeWalkthroughStep>
          <CodeWalkthroughStep title="Save a new task" file="server.js" :code="POST">
            <p>To read a JSON body, Express needs <code>express.json()</code>. Then <code>POST /tasks</code> builds the task, keeps it and answers <code>201 Created</code>.</p>
          </CodeWalkthroughStep>
          <CodeWalkthroughStep title="Choose the port" file="server.js" :code="LISTEN" highlight="21-25">
            <p>Read the port from the environment, as a hosting service sets it, and say where the server is listening.</p>
          </CodeWalkthroughStep>
        </CodeWalkthrough>
        <p class="mt-16 text-fg-secondary">That's the whole API.</p>
      </div>`,
  }),
} satisfies Meta<typeof CodeWalkthrough>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Scroll the steps: the code turns into each step's code. Lines that stay only move, new ones come
 * into focus as a wave, and what the step is about stands out. On a narrow screen each step shows
 * its own code instead.
 */
export const Default: Story = {}
