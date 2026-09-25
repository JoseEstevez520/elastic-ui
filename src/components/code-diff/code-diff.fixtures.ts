// For the stories only: an agent's edit to a small Express server.

export const BEFORE = `import express from 'express'

const app = express()
app.use(express.json())

const tasks = []

app.get('/tasks', (req, res) => {
  res.json(tasks)
})

app.post('/tasks', (req, res) => {
  const task = { id: tasks.length + 1, title: req.body.title }
  tasks.push(task)
  res.json(task)
})

app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex((t) => t.id === Number(req.params.id))
  tasks.splice(index, 1)
  res.status(204).end()
})

app.listen(3000)`

// What an agent might do when asked to "reject tasks without a title": a check, and the right status.
export const AFTER = BEFORE.replace(
  `app.post('/tasks', (req, res) => {
  const task = { id: tasks.length + 1, title: req.body.title }
  tasks.push(task)
  res.json(task)
})`,
  `app.post('/tasks', (req, res) => {
  const title = req.body.title?.trim()
  if (!title) return res.status(400).json({ error: 'A task needs a title' })

  const task = { id: tasks.length + 1, title }
  tasks.push(task)
  res.status(201).json(task)
})`,
)
