import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Term from './Term.vue'

const meta = { title: 'Lab/Term', component: Term } satisfies Meta<typeof Term>
export default meta
type Story = StoryObj<typeof meta>

/** Notes with words that open to what they mean: press one, then "More". */
export const InNotes: Story = {
  render: () => ({
    components: { Term },
    template: `
      <article class="prose article py-10">
        <h2>What makes an agent</h2>
        <p>
          A model on its own only answers. Put it inside a
          <Term title="Harness">harness<template #definition>The program around a model that gives it tools, runs them for it and feeds back what they return, turn after turn.</template><template #more><p>OpenCode and Claude Code are harnesses: they read files, run commands and edit code on the model's behalf, and show it the results so it can decide the next step. The model decides; the harness acts.</p></template></Term>
          and it can act: read a file, run a test, fix what failed. When a task is large, it can hand part of it to a
          <Term title="Subagent">subagent<template #definition>A second agent the first one starts for part of the work, with its own context, which hands back only its answer.</template></Term>,
          which works on its own and reports back, so the main
          <Term title="Context window">context<template #definition>Everything the model can see at once: the conversation, the files it has read, the tools' results.</template><template #more><p>It is measured in tokens and has a limit. Long sessions fill it, which is one reason to hand searches to subagents: only their answer comes back into the main context.</p></template></Term>
          stays small.
        </p>
        <p>That loop, read, act, check, report, is what turns a model into an agent.</p>
      </article>`,
  }),
}
