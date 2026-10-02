import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Braces, Check, CircleHelp, FileCode, Globe, Hammer, ListChecks, Route, X } from '@lucide/vue'
import Diagram from './Diagram.vue'
import DiagramArea from './DiagramArea.vue'
import DiagramArrow from './DiagramArrow.vue'
import DiagramChip from './DiagramChip.vue'
import DiagramGroup from './DiagramGroup.vue'
import DiagramImage from './DiagramImage.vue'
import DiagramItem from './DiagramItem.vue'
import { HARNESS, PARTS_SVG, STEPS, TREND_SVG } from './diagram.fixtures'

const parts = { Diagram, DiagramGroup, DiagramArea, DiagramChip, DiagramItem, DiagramArrow }
// One colour per concept, as a page would keep them.
const COLORS = { client: '#2563eb', controller: '#7c3aed', view: '#0891b2', data: '#db2777', harness: '#0d9488', model: '#7c3aed', project: '#ca8a04' }

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

/**
 * The same drawing from the diagram's parts: a group lays them out in a row, an area holds the
 * model and its tools, the arrows point both ways. Narrow the canvas: once the row no longer fits,
 * it runs down and its arrows turn with it, measured from the parts, not from a breakpoint.
 */
export const Composed: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ harness: HARNESS, colors: COLORS }),
    template: `
      <Diagram label="An agent: the model inside a harness that gives it tools, instructions and permissions, between you and your project" class="max-w-2xl rounded-[var(--radius-xl)] bg-bg-subtle p-5 sm:p-6">
        <DiagramGroup>
          <DiagramChip :icon="harness.you" color="var(--color-fg-muted)">You</DiagramChip>
          <DiagramArrow both />
          <DiagramArea :color="colors.harness" layout="grid">
            <template #title>Harness <span class="font-normal text-fg-muted">· what you give the model</span></template>
            <DiagramItem v-for="tool in harness.tools" :key="tool.label" :icon="tool.icon">{{ tool.label }}</DiagramItem>
          </DiagramArea>
          <DiagramArrow both />
          <DiagramChip :icon="harness.project" :color="colors.project">Your project</DiagramChip>
        </DiagramGroup>
      </Diagram>`,
  }),
}

/**
 * A request's path: areas with chips in a wrapping row, arrows with a word on them, and a group of
 * two areas stacked at the end of the row.
 */
export const Flow: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ colors: COLORS, icons: { Braces, FileCode, Globe, Route } }),
    template: `
      <Diagram label="A request goes from the browser or Postman to the controller, which answers with an HTML view or with JSON data" class="max-w-3xl rounded-[var(--radius-xl)] bg-bg-subtle p-5 sm:p-6">
        <DiagramGroup>
          <DiagramArea title="Client" :icon="icons.Globe" :color="colors.client" layout="row" note="Asks for a URL (GET).">
            <DiagramChip>Browser</DiagramChip>
            <DiagramChip>Postman</DiagramChip>
          </DiagramArea>
          <DiagramArrow label="GET" />
          <DiagramArea title="Controller" :icon="icons.Route" :color="colors.controller" note="Finds the method for that route.">
            <DiagramChip>@GetMapping("/products")</DiagramChip>
          </DiagramArea>
          <DiagramArrow />
          <DiagramGroup layout="column">
            <DiagramArea :color="colors.view" note="@Controller">
              <DiagramChip :icon="icons.FileCode">View (HTML)</DiagramChip>
            </DiagramArea>
            <DiagramArea :color="colors.data" note="@RestController">
              <DiagramChip :icon="icons.Braces">Data (JSON)</DiagramChip>
            </DiagramArea>
          </DiagramGroup>
        </DiagramGroup>
      </Diagram>`,
  }),
}

/** The same request on a phone: the row runs down, its arrows point down, the areas take the width. */
export const PhoneWidth: Story = {
  ...Flow,
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/**
 * A grid of areas, two across where there is room and one where there is not, each with a list of
 * what it may do in the outcomes' colours, under a chip the arrow comes down from.
 */
export const Grid: Story = {
  render: () => ({
    components: parts,
    setup: () => {
      const yes = { icon: Check, text: 'yes', color: 'var(--color-success)' }
      const ask = { icon: CircleHelp, text: 'asks you', color: 'var(--color-warning)' }
      const no = { icon: X, text: 'no', color: 'var(--color-danger)' }
      const roles = [
        { name: 'Builder', icon: Hammer, does: 'Makes the change you ask for.', may: [['Edits', yes], ['Runs commands', yes]] },
        { name: 'Planner', icon: ListChecks, does: 'Thinks the change through and proposes it.', may: [['Edits', ask], ['Runs commands', ask]] },
        { name: 'Tutor', icon: CircleHelp, does: 'Explains, but does not solve the exercise.', may: [['Edits', no], ['Runs commands', no]] },
        { name: 'Explorer', icon: Globe, does: 'Sent to look something up; comes back with the answer only.', may: [['Reads', yes], ['Edits', no]] },
      ]
      return { roles, colors: COLORS, model: HARNESS.model }
    },
    template: `
      <Diagram label="A team of agents: all share one model, and each has its role and permissions" class="max-w-2xl rounded-[var(--radius-xl)] bg-bg-subtle p-5 sm:p-6">
        <DiagramGroup layout="column">
          <DiagramChip :icon="model" :color="colors.model" note="thinks in all of them">One model</DiagramChip>
          <DiagramArrow />
          <DiagramGroup layout="grid">
            <DiagramArea v-for="role in roles" :key="role.name" :title="role.name" :icon="role.icon" :color="colors.harness" :note="role.does">
              <DiagramItem v-for="[action, state] in role.may" :key="action" :icon="state.icon" :color="state.color">{{ action }}: {{ state.text }}</DiagramItem>
            </DiagramArea>
          </DiagramGroup>
        </DiagramGroup>
      </Diagram>`,
  }),
}

/**
 * A drawing made elsewhere, by a model or a tool, shown as an image: it runs nothing and reaches
 * nothing, and it takes the theme's tokens and the diagram classes. Switch the theme to see it
 * drawn again.
 */
export const FromAnSvg: Story = {
  render: () => ({
    components: { Diagram, DiagramImage },
    setup: () => ({ svg: PARTS_SVG }),
    template: `
      <Diagram label="An agent: the model inside a harness whose tools reach your project" class="max-w-2xl rounded-[var(--radius-xl)] bg-bg-subtle p-4 sm:p-5">
        <DiagramImage :svg="svg" />
      </Diagram>`,
  }),
}
