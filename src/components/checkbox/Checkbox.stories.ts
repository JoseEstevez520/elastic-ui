import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import Switch from '../switch/Switch.vue'
import Checkbox from './Checkbox.vue'

const meta = {
  title: 'Forms/Checkbox & Switch',
  component: Checkbox,
  render: () => ({
    components: { Checkbox },
    setup: () => ({ terms: ref(false) }),
    template: `<Checkbox v-model="terms">I accept the terms</Checkbox>`,
  }),
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** A parent box in between while only some of its children are checked. */
export const Indeterminate: Story = {
  render: () => ({
    components: { Checkbox },
    setup() {
      const items = ref({ HTML: true, CSS: false, JavaScript: false })
      const all = computed({
        get: () => {
          const values = Object.values(items.value)
          return values.every(Boolean) ? true : values.some(Boolean) ? 'indeterminate' : false
        },
        set: (value) => {
          for (const key of Object.keys(items.value)) items.value[key as keyof typeof items.value] = value === true
        },
      })
      return { items, all }
    },
    template: `
      <div class="flex flex-col gap-2.5">
        <Checkbox v-model="all">Web client</Checkbox>
        <div class="flex flex-col gap-2.5 pl-6">
          <Checkbox v-for="(_, name) in items" :key="name" v-model="items[name]">{{ name }}</Checkbox>
        </div>
      </div>`,
  }),
}

export const SwitchStory: Story = {
  name: 'Switch',
  render: () => ({
    components: { Switch },
    setup: () => ({ notifications: ref(true), sounds: ref(false) }),
    template: `
      <div class="flex flex-col gap-3">
        <Switch v-model="notifications">Notifications</Switch>
        <Switch v-model="sounds">Sounds</Switch>
        <Switch disabled>Not available</Switch>
      </div>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

export const Disabled: Story = {
  render: () => ({
    components: { Checkbox },
    template: `
      <div class="flex flex-col gap-2.5">
        <Checkbox disabled>Unchecked and disabled</Checkbox>
        <Checkbox :model-value="true" disabled>Checked and disabled</Checkbox>
      </div>`,
  }),
}

/** A label much longer than in English wraps beside the box, which stays at the first line. */
export const LongLabel: Story = {
  render: () => ({
    components: { Checkbox, Switch },
    template: `
      <div class="flex max-w-xs flex-col gap-3">
        <Checkbox>Acepto que mis datos se usen para mejorar el servicio y recibir comunicaciones ocasionales</Checkbox>
        <Switch>Enviar un resumen semanal por correo electrónico a todas las personas del equipo</Switch>
      </div>`,
  }),
}
