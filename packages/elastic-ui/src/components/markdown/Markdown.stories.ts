import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TableOfContents from '../table-of-contents/TableOfContents.vue'
import Markdown from './Markdown.vue'
import { headingsOf } from './markdown.utils'

const F = '```'

const GUIDE = [
  '# Your first API with Express',
  '',
  'This guide builds a small **tasks API**, step by step. You need Node 20 or later; check it with `node --version`.',
  '',
  '> [!NOTE]',
  '> The practice is handed in through the virtual classroom, not by email.',
  '',
  '## Set up the project',
  '',
  'Create a folder, start a project in it and add Express:',
  '',
  `${F}bash`,
  'mkdir tasks-api && cd tasks-api',
  'npm init -y',
  'npm install express',
  F,
  '',
  '> [!TIP]',
  '> Add `"type": "module"` to `package.json` to write `import` instead of `require`.',
  '',
  'Or watch it done:',
  '',
  `${F}terminal title="~/tasks-api"`,
  '# Start the project and add Express',
  '$ npm init -y && npm install express',
  'added 65 packages in 2s',
  '',
  '# Check the version',
  '$ npm ls express',
  'tasks-api@1.0.0',
  '└── express@5.1.0',
  F,
  '',
  '## Build it',
  '',
  `${F}walkthrough`,
  JSON.stringify(
    {
      steps: [
        {
          title: 'Start a server',
          file: 'server.js',
          code: "import express from 'express'\n\nconst app = express()\n\napp.listen(3000)",
          text: 'Import Express, create the app and listen on a port. Every request gets a **404** for now.',
        },
        {
          title: 'List the tasks',
          file: 'server.js',
          code: "import express from 'express'\n\nconst app = express()\n\nconst tasks = []\n\napp.get('/tasks', (req, res) => {\n  res.json(tasks)\n})\n\napp.listen(3000)",
          text: 'Keep the tasks in an array and answer `GET /tasks` with them.',
        },
      ],
    },
    null,
    2,
  ),
  F,
  '',
  '## Reject a task without a title',
  '',
  'A change to `POST /tasks`, as a diff:',
  '',
  `${F}diff title="server.js"`,
  " app.post('/tasks', (req, res) => {",
  '-  const task = { id: tasks.length + 1, title: req.body.title }',
  '+  const title = req.body.title?.trim()',
  "+  if (!title) return res.status(400).json({ error: 'A task needs a title' })",
  '+',
  '+  const task = { id: tasks.length + 1, title }',
  '   tasks.push(task)',
  '-  res.json(task)',
  '+  res.status(201).json(task)',
  ' })',
  F,
  '',
  '> [!WARNING]',
  '> The tasks live in memory: restarting the server loses them.',
  '',
  '## Status codes',
  '',
  '| Code | Meaning | When |',
  '| --- | --- | --- |',
  '| `200` | OK | A read that went well |',
  '| `201` | Created | A task was saved |',
  '| `400` | Bad Request | The body is missing something |',
  '| `404` | Not Found | No such route or task |',
  '',
  '### Further reading',
  '',
  '- The [Express guide](https://expressjs.com/en/guide/routing.html), on routing.',
  '- The [next page](/notes/databases), on keeping tasks in a database.',
].join('\n')

const meta = {
  title: 'Text/Markdown',
  component: Markdown,
  parameters: { layout: 'fullscreen' },
  args: { source: GUIDE },
  render: (args) => ({
    components: { Markdown, TableOfContents },
    setup: () => ({ args, headings: headingsOf(args.source) }),
    template: `
      <div class="mx-auto grid max-w-6xl gap-16 px-6 py-16 xl:grid-cols-[minmax(0,1fr)_13rem]">
        <Markdown v-bind="args" class="min-w-0" />
        <TableOfContents :items="headings" class="sticky top-16 hidden self-start xl:block" />
      </div>`,
  }),
} satisfies Meta<typeof Markdown>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A guide written in plain Markdown: the fences turn into a CodeBlock, a CodeWalkthrough and a
 * CodeDiff, the alerts into Callouts, the table spans the text, and the headings feed the
 * TableOfContents beside it (`headingsOf`).
 */
export const Default: Story = {}

/**
 * A checklist, as GitHub writes it: each box stands where the bullet would be, a done item steps
 * back to grey, and a long item wraps under its own text. A plain list beside it keeps its bullets.
 */
export const Checklist: Story = {
  args: {
    source: [
      '## Before the exam',
      '',
      '- [x] Read the notes on branches',
      '- [x] Try `git rebase` on a copy of the repository',
      '- [ ] Write down, in my own words, what happens to the commits a rebase rewrites, and why a pushed branch should not be rebased',
      '- [ ] Ask about merge conflicts',
      '',
      'What to bring:',
      '',
      '- A pen',
      '- The class notes',
    ].join('\n'),
  },
  render: (args) => ({
    components: { Markdown },
    setup: () => ({ args }),
    template: `<div class="mx-auto max-w-2xl px-6 py-16"><Markdown v-bind="args" /></div>`,
  }),
}
