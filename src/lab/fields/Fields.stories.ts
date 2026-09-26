import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Field from '../../components/field/Field.vue'
import Input from '../../components/input/Input.vue'
import Textarea from '../../components/input/Textarea.vue'
import Select from '../../components/select/Select.vue'
import SelectContent from '../../components/select/SelectContent.vue'
import SelectItem from '../../components/select/SelectItem.vue'
import SelectTrigger from '../../components/select/SelectTrigger.vue'
import SelectValue from '../../components/select/SelectValue.vue'

/**
 * Lab: fields as lines ("Now": a hairline round each, no fill) and as trays ("Tray": set into the
 * page a tone off it, no line at rest; a line comes on hover, darkens on focus, turns red when
 * invalid). The same form in each; the tray is only the `--input-*` tokens, so nothing else changes.
 */
const meta = { title: 'Lab/Fields', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const parts = { Field, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
const form = `
  <form class="grid max-w-sm gap-5" @submit.prevent>
    <Field label="Name"><Input placeholder="Ada Lovelace" /></Field>
    <Field label="Email" description="We only write about your notes." error="That address has no @.">
      <Input model-value="ada.example.com" />
    </Field>
    <Field label="Module">
      <Select class="w-full">
        <SelectTrigger><SelectValue placeholder="Pick a module" /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="m in ['Web client', 'Web server', 'Deployment', 'Design']" :key="m" :value="m">{{ m }}</SelectItem>
        </SelectContent>
      </Select>
    </Field>
    <Field label="Notes"><Textarea placeholder="Anything else" /></Field>
  </form>`

/** As fields are today: a hairline round each and no fill. */
export const Now: Story = { render: () => ({ components: parts, template: form }) }

/** Trays: a tone off the page and no line at rest. */
export const Tray: Story = {
  render: () => ({
    components: parts,
    template: `
      <div style="--input-bg: var(--color-surface); --input-border: transparent; --input-border-hover: var(--color-border-strong)">
        ${form}
      </div>`,
  }),
}
