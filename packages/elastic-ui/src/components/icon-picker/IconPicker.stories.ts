import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Atom, BookOpen, Bot, Code, Database, Globe, GraduationCap, Heart, Layers, Music, Rocket, Star } from '@lucide/vue'
import { ref } from 'vue'
import IconPicker from './IconPicker.vue'

// The library ships no icons; the project passes the ones it offers.
const icons = { Atom, BookOpen, Bot, Code, Database, Globe, GraduationCap, Heart, Layers, Music, Rocket, Star }
const colors = [
  { value: null, label: 'Grey' },
  { value: '#2563eb', label: 'Blue' },
  { value: '#0d9488', label: 'Teal' },
  { value: '#7c3aed', label: 'Violet' },
  { value: '#d97706', label: 'Amber' },
  { value: '#e11d48', label: 'Rose' },
]

const meta = {
  title: 'Forms/IconPicker',
  component: IconPicker,
  parameters: { layout: 'centered' },
  decorators: [() => ({ template: '<div class="h-80 w-80"><story /></div>' })],
} satisfies Meta<typeof IconPicker>
export default meta
type Story = StoryObj<typeof meta>

/** A line at rest: the icon in its colour and its name. Opened, a row of colours and a grid of icons. */
export const Default: Story = {
  render: () => ({
    components: { IconPicker },
    setup: () => ({ icon: ref<string | null>('BookOpen'), color: ref<string | null>('#2563eb'), icons, colors }),
    template: `<IconPicker v-model:icon="icon" v-model:color="color" :icons="icons" :colors="colors" />`,
  }),
}

/** Situation, count: nothing chosen yet. */
export const Empty: Story = {
  render: () => ({
    components: { IconPicker },
    setup: () => ({ icon: ref<string | null>(null), color: ref<string | null>(null), icons, colors }),
    template: `<IconPicker v-model:icon="icon" v-model:color="color" :icons="icons" :colors="colors" />`,
  }),
}

/** Without `colors` it only picks an icon. */
export const IconOnly: Story = {
  render: () => ({
    components: { IconPicker },
    setup: () => ({ icon: ref<string | null>('Rocket'), icons }),
    template: `<IconPicker v-model:icon="icon" :icons="icons" />`,
  }),
}

/** Situation, languages: its texts in the app's own words. */
export const Spanish: Story = {
  render: () => ({
    components: { IconPicker },
    setup: () => ({
      icon: ref<string | null>(null),
      color: ref<string | null>(null),
      icons,
      colors: colors.map((c) => ({ ...c, label: { Grey: 'Gris', Blue: 'Azul', Teal: 'Verde azulado', Violet: 'Violeta', Amber: 'Ámbar', Rose: 'Rosa' }[c.label] ?? c.label })),
    }),
    template: `<IconPicker v-model:icon="icon" v-model:color="color" :icons="icons" :colors="colors" label="Icono" none-label="Sin icono" />`,
  }),
}

/** Situation, count: far more icons than fit, which scroll inside the panel. */
export const Many: Story = {
  render: () => ({
    components: { IconPicker },
    setup() {
      const many: Record<string, unknown> = {}
      for (let i = 0; i < 6; i++) for (const [name, c] of Object.entries(icons)) many[`${name}${i || ''}`] = c
      return { icon: ref<string | null>('Star'), color: ref<string | null>(null), icons: many, colors }
    },
    template: `<IconPicker v-model:icon="icon" v-model:color="color" :icons="icons" :colors="colors" />`,
  }),
}

/** Situation, coexistence: two on one page, each on its own. */
export const Two: Story = {
  render: () => ({
    components: { IconPicker },
    setup: () => ({ a: ref<string | null>('Globe'), b: ref<string | null>('Music'), icons }),
    template: `<div class="flex flex-col gap-3"><IconPicker v-model:icon="a" :icons="icons" /><IconPicker v-model:icon="b" :icons="icons" /></div>`,
  }),
}
