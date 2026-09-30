import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Field from '../field/Field.vue'
import Combobox from './Combobox.vue'

const MODULES = [
  { value: 'dwec', label: 'Web client development', description: 'JavaScript, the DOM, Vue' },
  { value: 'dwes', label: 'Web server development', description: 'PHP, Laravel, APIs' },
  { value: 'diw', label: 'Interface design', description: 'HTML, CSS, accessibility' },
  { value: 'daw', label: 'Web application deployment', description: 'Servers, Docker, CI' },
  { value: 'eie', label: 'Business and entrepreneurship' },
  { value: 'ing', label: 'Technical English' },
  { value: 'pfc', label: 'Final project' },
]

const meta = {
  title: 'Forms/Combobox',
  component: Combobox,
  args: { options: MODULES },
  render: (args) => ({
    components: { Combobox, Field },
    setup: () => ({ args, module: ref<string>() }),
    template: `
      <Field label="Module" description="Type to narrow the list." class="max-w-sm">
        <Combobox v-bind="args" v-model="module" placeholder="Search a module" />
      </Field>`,
  }),
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

/** Type to narrow the options, pick one with the arrow keys and Enter, or click the chevron for all of them. */
export const Default: Story = {}

/** Plain strings as options, and nothing matching what is written. */
export const Strings: Story = {
  args: { options: ['Madrid', 'Barcelona', 'Vigo', 'A Coruña', 'Santiago de Compostela', 'Pontevedra', 'Lugo', 'Ourense'] },
}
