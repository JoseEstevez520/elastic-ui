import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Field from '../field/Field.vue'
import Slider from './Slider.vue'

const meta = {
  title: 'Forms/Slider',
  component: Slider,
  args: { label: 'Volume' },
  render: (args) => ({
    components: { Slider },
    setup: () => ({ args, value: ref(40) }),
    template: `<div class="w-72"><Slider v-bind="args" v-model="value" /></div>`,
  }),
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

/** Held or moved with the keys, the knob grows into a pill with the value, and back once let go. */
export const Default: Story = {}

/** Two thumbs for a range between them. */
export const Range: Story = {
  render: () => ({
    components: { Slider },
    setup: () => ({ value: ref([20, 70]) }),
    template: `<div class="w-72"><Slider v-model="value" label="Price" :format="(v) => v + ' €'" /></div>`,
  }),
}

/** In a Field, which names it and tells what it is for. */
export const InField: Story = {
  render: () => ({
    components: { Field, Slider },
    setup: () => ({ value: ref(1.5) }),
    template: `
      <Field label="Line height" description="Space between the lines of text." class="w-72">
        <Slider v-model="value" :min="1" :max="2" :step="0.05" :format="(v) => v.toFixed(2)" />
      </Field>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

export const Disabled: Story = { args: { disabled: true } }

/** At its ends the pill reaches past the track rather than jumping in to stay inside it. */
export const AtTheEnds: Story = {
  render: () => ({
    components: { Slider },
    setup: () => ({ low: ref(0), high: ref(100) }),
    template: `<div class="flex w-72 flex-col gap-6"><Slider v-model="low" label="Low" /><Slider v-model="high" label="High" /></div>`,
  }),
}
