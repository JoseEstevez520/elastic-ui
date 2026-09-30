import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Collapsible from './Collapsible.vue'
import CollapsibleContent from './CollapsibleContent.vue'
import CollapsibleTrigger from './CollapsibleTrigger.vue'

const parts = { Collapsible, CollapsibleTrigger, CollapsibleContent }

const meta = {
  title: 'Disclosure/Collapsible',
  // Top-aligned: centering would re-center the section as it grows.
  render: () => ({
    components: parts,
    template: `
      <div class="max-w-lg">
        <p class="text-fg">An agent is a model inside a harness: the model thinks, the harness reads files and runs commands.</p>
        <Collapsible>
          <CollapsibleTrigger class="w-auto justify-start gap-1.5 text-sm text-fg-muted">More detail</CollapsibleTrigger>
          <CollapsibleContent>
            The harness gives the model its eyes and hands: it reads your project, edits files and runs
            commands, then shows the model what happened so it can decide the next step.
          </CollapsibleContent>
        </Collapsible>
      </div>`,
  }),
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

/** "More detail" under a paragraph: the concrete first, the rest one click away. */
export const ReadMore: Story = {}

export const Section: Story = {
  render: () => ({
    components: parts,
    template: `
      <Collapsible default-open class="max-w-lg">
        <CollapsibleTrigger>Requirements</CollapsibleTrigger>
        <CollapsibleContent>
          <ul class="flex list-disc flex-col gap-1 pl-5">
            <li>Node 20 or later</li>
            <li>A Vue 3 project with Tailwind v4</li>
            <li>motion-v installed</li>
          </ul>
        </CollapsibleContent>
      </Collapsible>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

export const LongContent: Story = {
  render: () => ({
    components: parts,
    template: `
      <Collapsible class="max-w-lg">
        <CollapsibleTrigger>A long section</CollapsibleTrigger>
        <CollapsibleContent>
          <p v-for="n in 12" :key="n" class="mb-3">Paragraph {{ n }}: enough text to make the section much taller than the screen, to check the height animation and the fade still read as one movement.</p>
        </CollapsibleContent>
      </Collapsible>`,
  }),
}

/** Collapsibles inside collapsibles, as in a navigation tree. */
export const Nested: Story = {
  render: () => ({
    components: parts,
    template: `
      <Collapsible class="max-w-xs">
        <CollapsibleTrigger>Modules</CollapsibleTrigger>
        <CollapsibleContent class="pb-0 pl-4">
          <Collapsible v-for="module in ['Web client', 'Web server', 'Deployment']" :key="module">
            <CollapsibleTrigger class="py-2 text-sm">{{ module }}</CollapsibleTrigger>
            <CollapsibleContent class="pb-2 pl-4 text-sm">
              <p v-for="unit in ['Unit 1', 'Unit 2', 'Unit 3']" :key="unit" class="py-1">{{ unit }}</p>
            </CollapsibleContent>
          </Collapsible>
        </CollapsibleContent>
      </Collapsible>`,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: parts,
    template: `
      <Collapsible disabled class="max-w-lg">
        <CollapsibleTrigger>Not available yet</CollapsibleTrigger>
        <CollapsibleContent>Hidden.</CollapsibleContent>
      </Collapsible>`,
  }),
}
