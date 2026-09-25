import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ScrollIndicator from './ScrollIndicator.vue'

const PARAGRAPH =
  'A coding agent reads your project, decides what to change and changes it, then looks at what happened and decides again. Each part of that loop is simple on its own; what makes it useful is how they fit together.'

const meta = {
  title: 'Navigation/ScrollIndicator',
  component: ScrollIndicator,
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { ScrollIndicator },
    setup: () => ({ PARAGRAPH }),
    template: `
      <div class="mx-auto max-w-2xl px-6 py-16">
        <ScrollIndicator />
        <h1 class="mb-8 text-3xl font-semibold">A long page</h1>
        <p v-for="n in 40" :key="n" class="mb-4 leading-relaxed text-fg-secondary">{{ PARAGRAPH }}</p>
      </div>`,
  }),
} satisfies Meta<typeof ScrollIndicator>

export default meta
type Story = StoryObj<typeof meta>

/**
 * It shows for a moment as the page opens, to say there is more. Scroll: a short line slides down
 * the right edge, the same length however long the page, and fades soon after you stop. Bring the
 * pointer to the edge to see it, and drag it.
 */
export const Default: Story = {}

/** Inside something that scrolls on its own: beside it in a positioned box, with `target`. */
export const InsideAPanel: Story = {
  render: () => ({
    components: { ScrollIndicator },
    setup: () => ({ PARAGRAPH }),
    template: `
      <div class="p-10">
        <div class="relative h-80 max-w-md rounded-xl border border-border">
          <div id="panel" class="h-full overflow-y-auto p-5">
            <p v-for="n in 15" :key="n" class="mb-3 text-sm leading-relaxed text-fg-secondary">{{ PARAGRAPH }}</p>
          </div>
          <ScrollIndicator target="#panel" :length="28" />
        </div>
      </div>`,
  }),
}
