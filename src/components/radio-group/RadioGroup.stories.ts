import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import RadioGroup from './RadioGroup.vue'
import RadioGroupItem from './RadioGroupItem.vue'

const meta = {
  title: 'Forms/RadioGroup',
  component: RadioGroup,
  render: () => ({
    components: { RadioGroup, RadioGroupItem },
    setup: () => ({ plan: ref('monthly') }),
    template: `
      <RadioGroup v-model="plan" label="Billing">
        <RadioGroupItem value="monthly" description="Cancel any time.">Monthly</RadioGroupItem>
        <RadioGroupItem value="yearly" description="Two months free.">Yearly</RadioGroupItem>
        <RadioGroupItem value="lifetime" disabled description="Not offered now.">Lifetime</RadioGroupItem>
      </RadioGroup>`,
  }),
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

/** One choice among a few, all in view: the dot grows out of the centre of the one chosen. Arrow keys move. */
export const Default: Story = {}

/** In a row, for short labels. */
export const Row: Story = {
  render: () => ({
    components: { RadioGroup, RadioGroupItem },
    setup: () => ({ size: ref('m') }),
    template: `
      <RadioGroup v-model="size" label="Size" row>
        <RadioGroupItem value="s">Small</RadioGroupItem>
        <RadioGroupItem value="m">Medium</RadioGroupItem>
        <RadioGroupItem value="l">Large</RadioGroupItem>
      </RadioGroup>`,
  }),
}
