import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Select from './Select.vue'
import SelectContent from './SelectContent.vue'
import SelectGroup from './SelectGroup.vue'
import SelectItem from './SelectItem.vue'
import SelectLabel from './SelectLabel.vue'
import SelectSeparator from './SelectSeparator.vue'
import SelectTrigger from './SelectTrigger.vue'
import SelectValue from './SelectValue.vue'

const parts = { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator }
const fruits = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple']

const meta = {
  title: 'Forms/Select',
  render: () => ({
    components: parts,
    setup: () => ({ fruits }),
    template: `
      <Select class="w-56">
        <SelectTrigger><SelectValue placeholder="Pick a fruit" /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="fruit in fruits" :key="fruit" :value="fruit">{{ fruit }}</SelectItem>
        </SelectContent>
      </Select>`,
  }),
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Groups: Story = {
  render: () => ({
    components: parts,
    template: `
      <Select default-value="vue" class="w-56">
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Frameworks</SelectLabel>
            <SelectItem value="vue">Vue</SelectItem>
            <SelectItem value="svelte">Svelte</SelectItem>
            <SelectItem value="react">React</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Meta-frameworks</SelectLabel>
            <SelectItem value="nuxt">Nuxt</SelectItem>
            <SelectItem value="sveltekit">SvelteKit</SelectItem>
            <SelectItem value="next" disabled>Next.js (not available)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>`,
  }),
}

/** Bound with `v-model`, and inside a form with a visible label. */
export const InForm: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ fruits, fruit: ref('Banana') }),
    template: `
      <form class="flex w-64 flex-col gap-2" @submit.prevent>
        <label for="fruit" class="text-sm font-medium text-fg">Favourite fruit</label>
        <Select v-model="fruit" name="fruit">
          <SelectTrigger id="fruit"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="f in fruits" :key="f" :value="f">{{ f }}</SelectItem>
          </SelectContent>
        </Select>
        <p class="text-sm text-fg-muted">Chosen: {{ fruit }}</p>
      </form>`,
  }),
}

export const Multiple: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ fruits, chosen: ref(['Apple', 'Grapes']) }),
    template: `
      <Select v-model="chosen" multiple class="w-64">
        <SelectTrigger><SelectValue placeholder="Pick fruits" /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="fruit in fruits" :key="fruit" :value="fruit">{{ fruit }}</SelectItem>
        </SelectContent>
      </Select>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** More options than fit: the list scrolls inside the field. */
export const ManyOptions: Story = {
  render: () => ({
    components: parts,
    setup: () => ({
      countries: Array.from({ length: 60 }, (_, i) => `Country ${i + 1}`),
    }),
    template: `
      <Select class="w-56">
        <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="c in countries" :key="c" :value="c">{{ c }}</SelectItem>
        </SelectContent>
      </Select>`,
  }),
}

/** Options much longer than the field: they wrap inside it, and the chosen one truncates. */
export const LongLabels: Story = {
  render: () => ({
    components: parts,
    template: `
      <Select default-value="a" class="w-44">
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Configuración de privacidad avanzada</SelectItem>
          <SelectItem value="b">Notificaciones por correo electrónico</SelectItem>
          <SelectItem value="c">Short</SelectItem>
        </SelectContent>
      </Select>`,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: parts,
    template: `
      <Select disabled class="w-56">
        <SelectTrigger><SelectValue placeholder="Not available" /></SelectTrigger>
        <SelectContent><SelectItem value="x">X</SelectItem></SelectContent>
      </Select>`,
  }),
}

export const TwoInstances: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ fruits }),
    template: `
      <div class="flex gap-4">
        <Select v-for="n in 2" :key="n" class="w-44">
          <SelectTrigger><SelectValue :placeholder="'Select ' + n" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="fruit in fruits" :key="fruit" :value="fruit">{{ fruit }}</SelectItem>
          </SelectContent>
        </Select>
      </div>`,
  }),
}
