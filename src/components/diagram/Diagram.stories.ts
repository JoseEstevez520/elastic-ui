import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Box, FileCode, Hammer, Layers } from '@lucide/vue'
import Diagram from './Diagram.vue'

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
        <svg viewBox="0 0 640 260" class="diagram w-full">
          <g class="diagram-in">
            <rect class="diagram-part" style="--diagram-color: var(--color-fg-muted)" x="0" y="112" width="84" height="36" />
            <text class="diagram-label" style="--diagram-color: var(--color-fg-muted)" x="42" y="135" text-anchor="middle">You</text>
          </g>
          <g class="diagram-in" style="--diagram-color: #0d9488">
            <rect class="diagram-part" x="150" y="16" width="300" height="228" />
            <text class="diagram-label" x="166" y="40">Harness</text>
            <text class="diagram-text" x="166" y="58">tools, instructions, permissions</text>
          </g>
          <g class="diagram-in" style="--diagram-color: #7c3aed">
            <rect class="diagram-part" x="240" y="78" width="120" height="40" style="fill: color-mix(in oklab, #7c3aed 22%, var(--color-bg))" />
            <text class="diagram-label" x="300" y="103" text-anchor="middle">Model</text>
          </g>
          <g class="diagram-in" style="--diagram-color: #0d9488">
            <rect class="diagram-part" x="176" y="172" width="76" height="34" style="fill: var(--color-bg)" />
            <text class="diagram-label" x="214" y="194" text-anchor="middle">Read</text>
            <rect class="diagram-part" x="262" y="172" width="76" height="34" style="fill: var(--color-bg)" />
            <text class="diagram-label" x="300" y="194" text-anchor="middle">Edit</text>
            <rect class="diagram-part" x="348" y="172" width="76" height="34" style="fill: var(--color-bg)" />
            <text class="diagram-label" x="386" y="194" text-anchor="middle">Run</text>
          </g>
          <g class="diagram-in">
            <rect class="diagram-part" style="--diagram-color: #ca8a04" x="516" y="112" width="124" height="36" />
            <text class="diagram-label" style="--diagram-color: #ca8a04" x="578" y="135" text-anchor="middle">Your project</text>
          </g>
          <g class="diagram-in">
            <path class="diagram-line" d="M84 130 C150 130 180 98 240 98" />
            <path class="diagram-quiet" d="M270 118 L214 172 M330 118 L386 172" />
            <path class="diagram-emphasis" d="M300 118 L300 172 M300 206 C300 250 500 250 540 148" />
          </g>
        </svg>
      </Diagram>`,
  }),
}

/** A chart as SkillNet draws them: axis and dashed grid, one line emphasised, labels at the lines' ends. */
export const Trend: Story = {
  render: () => ({
    components: { Diagram },
    template: `
      <Diagram label="As models get better, what they can personalise grows fastest, while time and cost fall" class="max-w-2xl">
        <svg viewBox="0 0 560 230" class="diagram w-full">
          <g class="diagram-in">
            <path class="diagram-grid" d="M28 50 H430 M28 101 H430 M28 152 H430" />
            <path class="diagram-line" d="M28 202 H430" />
            <text class="diagram-text" x="28" y="222">Today</text>
            <text class="diagram-text" x="430" y="222" text-anchor="end">More capable models</text>
          </g>
          <g class="diagram-in">
            <path class="diagram-quiet" d="M28 147 C115 145 171 134 224 109 S338 68 430 60" />
            <path class="diagram-quiet" d="M28 72 C110 76 158 101 220 130 S344 171 430 176" />
            <text class="diagram-text" x="442" y="64">Complexity</text>
            <text class="diagram-text" x="442" y="180">Time and cost</text>
          </g>
          <g class="diagram-in">
            <path class="diagram-emphasis" d="M28 174 C115 171 148 153 208 121 S328 48 430 34" />
            <text class="diagram-label" x="442" y="38">Personalisation</text>
          </g>
        </svg>
      </Diagram>`,
  }),
}

/** A process as tinted chips joined by plain arrows, in HTML, each in the colour of its concept. */
export const Process: Story = {
  render: () => ({
    components: { Diagram },
    setup: () => ({ steps: [
      { label: 'Code', icon: FileCode, color: 'var(--color-fg-muted)' },
      { label: 'Build', icon: Hammer, color: '#ca8a04' },
      { label: 'Image', icon: Layers, color: '#2563eb' },
      { label: 'Container', icon: Box, color: '#0d9488' },
    ] }),
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
