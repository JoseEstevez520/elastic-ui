import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Diagram from './Diagram.vue'
import { PARTS_SVG, STEPS, TREND_SVG } from './diagram.fixtures'

const meta = {
  title: 'Content/Diagram',
  component: Diagram,
  args: { label: '' },
} satisfies Meta<typeof Diagram>

export default meta
type Story = StoryObj<typeof meta>

/**
 * What an agent is, drawn with tints instead of boxes: the harness a tinted area round the model,
 * its tools tinted inside it, one path (edit to your project) emphasised and the rest quiet.
 */
export const Parts: Story = {
  render: () => ({
    components: { Diagram },
    template: `
      <Diagram label="An agent: the model inside a harness whose tools reach your project" caption="The harness is what lets the same model work in your project." class="max-w-2xl">
        ${PARTS_SVG}
      </Diagram>`,
  }),
}

/** A chart as SkillNet draws them: axis and dashed grid, one line emphasised, labels at the lines' ends. */
export const Trend: Story = {
  render: () => ({
    components: { Diagram },
    template: `
      <Diagram label="As models get better, what they can personalise grows fastest, while time and cost fall" class="max-w-2xl">
        ${TREND_SVG}
      </Diagram>`,
  }),
}

/** A process as tinted chips joined by plain arrows, in HTML, each in the colour of its concept. */
export const Process: Story = {
  render: () => ({
    components: { Diagram },
    setup: () => ({ steps: STEPS }),
    template: `
      <Diagram label="From code to a running container: build an image, then run it" caption="An image is built once; every container runs from it.">
        <div class="flex flex-wrap items-center gap-2">
          <template v-for="(step, i) in steps" :key="step.label">
            <span class="diagram-chip diagram-in" :style="{ '--diagram-color': step.color }">
              <component :is="step.icon" class="size-4" :stroke-width="1.5" aria-hidden="true" />
              {{ step.label }}
            </span>
            <span v-if="i < steps.length - 1" class="diagram-in text-fg-faint" aria-hidden="true">→</span>
          </template>
        </div>
      </Diagram>`,
  }),
}
