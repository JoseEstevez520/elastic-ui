import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import RadioGroup from '../../components/radio-group/RadioGroup.vue'
import RadioGroupItem from '../../components/radio-group/RadioGroupItem.vue'
import LabRadioGroup from './LabRadioGroup.vue'
import LabRadioItem from './LabRadioItem.vue'

/**
 * Lab: RadioGroup as the library's own, beside the current one. Trays instead of hairline circles,
 * and one dot that travels to the choice; `cards`, the raised surface sliding from row to row.
 */
const meta = { title: 'Lab/Radio', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const parts = { RadioGroup, RadioGroupItem, LabRadioGroup, LabRadioItem }
const plans = [
  { value: 'monthly', label: 'Monthly', detail: 'Cancel any time.' },
  { value: 'yearly', label: 'Yearly', detail: 'Two months free.' },
  { value: 'term', label: 'Per term', detail: 'Billed each September and February.' },
  { value: 'lifetime', label: 'Lifetime', detail: 'Not offered now.', disabled: true },
]

/** Now, travelling dot and cards, side by side: choose in each to compare. */
export const Compare: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ plans, a: ref('monthly'), b: ref('monthly'), c: ref('monthly') }),
    template: `
      <div class="grid gap-10 md:grid-cols-3">
        <div class="flex flex-col gap-3"><p class="text-meta text-fg-muted">Now</p>
          <RadioGroup v-model="a" label="Plan">
            <RadioGroupItem v-for="p in plans" :key="p.value" :value="p.value" :description="p.detail" :disabled="p.disabled">{{ p.label }}</RadioGroupItem>
          </RadioGroup>
        </div>
        <div class="flex flex-col gap-3"><p class="text-meta text-fg-muted">Travelling dot</p>
          <LabRadioGroup v-model="b" label="Plan">
            <LabRadioItem v-for="p in plans" :key="p.value" :value="p.value" :description="p.detail" :disabled="p.disabled">{{ p.label }}</LabRadioItem>
          </LabRadioGroup>
        </div>
        <div class="flex flex-col gap-3"><p class="text-meta text-fg-muted">Cards</p>
          <LabRadioGroup v-model="c" variant="cards" label="Plan">
            <LabRadioItem v-for="p in plans" :key="p.value" :value="p.value" :description="p.detail" :disabled="p.disabled">{{ p.label }}</LabRadioItem>
          </LabRadioGroup>
        </div>
      </div>`,
  }),
}

/** In a row: the dot travels sideways, its leading edge first. */
export const Row: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ size: ref('md') }),
    template: `
      <LabRadioGroup v-model="size" row label="Size">
        <LabRadioItem value="sm">Small</LabRadioItem>
        <LabRadioItem value="md">Medium</LabRadioItem>
        <LabRadioItem value="lg">Large</LabRadioItem>
      </LabRadioGroup>`,
  }),
}

/** Something is wrong with the choice: the trays take a line of the danger colour, and so does the dot. */
export const Invalid: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ plans, v: ref('yearly') }),
    template: `
      <LabRadioGroup v-model="v" invalid label="Plan">
        <LabRadioItem v-for="p in plans.slice(0, 3)" :key="p.value" :value="p.value">{{ p.label }}</LabRadioItem>
      </LabRadioGroup>`,
  }),
}

/** Nothing chosen yet: no dot anywhere until the first choice, which then just lands. */
export const NothingChosen: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ plans, v: ref<string>() }),
    template: `
      <LabRadioGroup v-model="v" variant="cards" label="Plan" class="max-w-sm">
        <LabRadioItem v-for="p in plans.slice(0, 3)" :key="p.value" :value="p.value" :description="p.detail">{{ p.label }}</LabRadioItem>
      </LabRadioGroup>`,
  }),
}
