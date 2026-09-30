import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Field from '../field/Field.vue'
import NumberField from './NumberField.vue'

const meta = {
  title: 'Forms/NumberField',
  component: NumberField,
  render: (args) => ({
    components: { NumberField },
    setup: () => ({ args, value: ref(3) }),
    template: `<NumberField v-bind="args" v-model="value" class="w-40" />`,
  }),
} satisfies Meta<typeof NumberField>

export default meta
type Story = StoryObj<typeof meta>

/** Stepped with − and +, or the arrow keys, its digits roll; typed, it is a plain field. */
export const Default: Story = { args: { min: 0, max: 20 } }

export const Currency: Story = {
  render: () => ({
    components: { NumberField },
    setup: () => ({ value: ref(1249.5) }),
    template: `<NumberField v-model="value" :step="10" locale="es-ES" :format-options="{ style: 'currency', currency: 'EUR' }" class="w-48" />`,
  }),
}

export const InField: Story = {
  render: () => ({
    components: { Field, NumberField },
    setup: () => ({ value: ref(25) }),
    template: `
      <Field label="Students" description="How many there are in the group." class="w-64">
        <NumberField v-model="value" :min="1" :max="40" />
      </Field>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** At its limit, the button on that side dims and does nothing. */
export const AtTheLimit: Story = { args: { min: 0, max: 3 } }

export const Empty: Story = {
  render: () => ({
    components: { NumberField },
    setup: () => ({ value: ref<number>() }),
    template: `<NumberField v-model="value" placeholder="Amount" class="w-40" />`,
  }),
}

export const Invalid: Story = { args: { invalid: true } }

export const Disabled: Story = { args: { disabled: true } }
