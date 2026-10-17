import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Accordion from '../accordion/Accordion.vue'
import AccordionContent from '../accordion/AccordionContent.vue'
import AccordionItem from '../accordion/AccordionItem.vue'
import AccordionTrigger from '../accordion/AccordionTrigger.vue'
import AgentReplay from '../agent-replay/AgentReplay.vue'
import { AGENTS, MODEL_ONLY, WITH_HARNESS } from '../agent-replay/agent-replay.fixtures'
import Diagram from '../diagram/Diagram.vue'
import { HARNESS, HARNESS_TEMPLATE } from '../diagram/diagram.fixtures'

const meta = {
  title: 'Text/Article',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { Accordion, AccordionContent, AccordionItem, AccordionTrigger, AgentReplay, Diagram },
    setup: () => ({ MODEL_ONLY, WITH_HARNESS, PLAN: AGENTS.plan, harness: HARNESS }),
    template: `
      <article class="prose article py-16">
        <h1>Coding agents</h1>
        <p><strong>A coding agent is a model with a harness</strong>: the tools, instructions and permissions that let it work in your project, not only answer about it.</p>
        <Diagram label="An agent: the model inside a harness, which gives it tools, instructions and permissions, between you and your project">${HARNESS_TEMPLATE}</Diagram>
        <p>The model is the same one you chat with. The harness is what changes what it can reach: your files, your terminal, your tests.</p>

        <h2>The same request, twice</h2>
        <p>Ask a model on its own to stop tasks without a title from being saved. It has never seen your project, so it answers with code for you to paste.</p>
        <AgentReplay :events="MODEL_ONLY" layout="stacked" />
        <p><strong>On its own, the model can only tell you what to do.</strong></p>
        <p>Now the same model, with a harness around it. It looks for the route, reads the file, makes the change and runs the tests, and only then tells you what it did.</p>
        <AgentReplay :events="WITH_HARNESS" layout="stacked" />
        <p><strong>With a harness, it does it itself</strong>: reading, editing and checking happen in your project, where you can see every step.</p>

        <h2>What the harness is made of</h2>
        <Accordion type="multiple">
          <AccordionItem value="tools">
            <AccordionTrigger>Tools</AccordionTrigger>
            <AccordionContent>What the model may ask for: read a file, search the project, edit, run a command. The harness does it and hands back the result.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="instructions">
            <AccordionTrigger>Instructions</AccordionTrigger>
            <AccordionContent>What it knows about your project before it starts: an AGENTS.md with how to build, test and name things.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="permissions">
            <AccordionTrigger>Permissions</AccordionTrigger>
            <AccordionContent>What it may do without asking. Editing and running commands can be allowed, asked first, or denied.</AccordionContent>
          </AccordionItem>
        </Accordion>

        <h2>Permissions decide</h2>
        <p>With editing set to ask first, as OpenCode's Plan agent has it, the agent stops before changing a file and waits for you. Here you say no: you only wanted to see the plan.</p>
        <AgentReplay :events="PLAN" layout="stacked" />
        <p><strong>Permissions decide what it may do without you.</strong></p>

        <p>Next: writing an agent of your own, with its instructions and its permissions.</p>
      </article>`,
  }),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * An article about coding agents, held to one width: a definition and its drawing, the same request
 * to a model alone and then with a harness, one after the other, what the harness is made of to
 * open in place, and permissions seen at work. The sessions play one at a time as they come into
 * view.
 */
export const Agents: Story = {}
