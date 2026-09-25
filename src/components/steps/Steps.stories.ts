import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Button from '../button/Button.vue'
import CodeBlock from '../code-block/CodeBlock.vue'
import Steps from './Steps.vue'
import StepsItem from './StepsItem.vue'
import StepsNext from './StepsNext.vue'

const parts = { Button, CodeBlock, Steps, StepsItem, StepsNext }

const meta = {
  title: 'Base/Steps',
  render: () => ({
    components: parts,
    template: `
      <Steps class="w-[28rem] max-w-full">
        <StepsItem title="Build and Plan">
          <p>OpenCode comes with two agents. Switch between them with Tab.</p>
          <StepsNext />
        </StepsItem>
        <StepsItem title="Your own agent">
          <p>Make another with your own instructions and permissions. This tutor cannot edit, however you ask.</p>
          <StepsNext />
        </StepsItem>
        <StepsItem title="Subagents">
          <p>An agent can hand part of the work to another, which works apart and only sends back the answer.</p>
        </StepsItem>
      </Steps>`,
  }),
} satisfies Meta<typeof Steps>

export default meta
type Story = StoryObj<typeof meta>

/** One step open at a time; Next or a title opens another, and the line fills down to it. */
export const Default: Story = {}

/** Every step shown, as a guide in docs: the numbers and line only lead the eye. */
export const Static: Story = {
  render: () => ({
    components: parts,
    template: `
      <Steps static class="w-[28rem] max-w-full">
        <StepsItem title="Install">
          <p>Add the library and its peers.</p>
          <CodeBlock code="npm install elastic-ui motion-v" language="bash" />
        </StepsItem>
        <StepsItem title="Add the styles">
          <p>Import the tokens and let Tailwind scan the components.</p>
        </StepsItem>
        <StepsItem title="Use a component">
          <p>Import it where you need it.</p>
        </StepsItem>
      </Steps>`,
  }),
}

/** Driven from outside with `v-model`: starts on the second step, which just shows. */
export const Controlled: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ step: ref(1) }),
    template: `
      <div class="flex w-[28rem] max-w-full flex-col gap-6">
        <div class="flex gap-2">
          <Button size="sm" variant="outline" :disabled="step === 0" @click="step--">Back</Button>
          <Button size="sm" variant="outline" :disabled="step === 3" @click="step++">Forward</Button>
          <span class="self-center text-sm text-fg-muted">Step {{ step + 1 }}</span>
        </div>
        <Steps v-model="step">
          <StepsItem v-for="n in 4" :key="n" :title="'Step ' + n">
            <p>What happens in step {{ n }}.</p>
          </StepsItem>
        </Steps>
      </div>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** A single step: a number, no line. */
export const One: Story = {
  render: () => ({
    components: parts,
    template: `
      <Steps class="w-[28rem] max-w-full">
        <StepsItem title="Only step"><p>Nothing to go on to, so no Next.</p><StepsNext /></StepsItem>
      </Steps>`,
  }),
}

/** Many steps, past nine: the numbers keep their circle. */
export const Many: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ step: ref(10) }),
    template: `
      <Steps v-model="step" class="w-[28rem] max-w-full">
        <StepsItem v-for="n in 12" :key="n" :title="'Step ' + n">
          <p>What happens in step {{ n }}.</p>
          <StepsNext />
        </StepsItem>
      </Steps>`,
  }),
}

/** Long titles wrap beside their number; long content stays in its column. */
export const LongText: Story = {
  render: () => ({
    components: parts,
    template: `
      <Steps class="w-[22rem] max-w-full">
        <StepsItem title="A title long enough to need a second line next to its number">
          <p>Paragraphs of any length keep to the column beside the line, which runs down as far as the step does. Paragraphs of any length keep to the column beside the line.</p>
          <StepsNext />
        </StepsItem>
        <StepsItem title="Short"><p>Short.</p></StepsItem>
      </Steps>`,
  }),
}

/** Two on a page keep their own step. */
export const TwoOnAPage: Story = {
  render: () => ({
    components: parts,
    template: `
      <div class="grid w-[40rem] max-w-full gap-8 sm:grid-cols-2">
        <Steps v-for="list in 2" :key="list">
          <StepsItem v-for="n in 3" :key="n" :title="'List ' + list + ', step ' + n">
            <p>Content.</p>
            <StepsNext />
          </StepsItem>
        </Steps>
      </div>`,
  }),
}
