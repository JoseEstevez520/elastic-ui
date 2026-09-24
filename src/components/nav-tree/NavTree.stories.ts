import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import NavTree from './NavTree.vue'
import NavTreeGroup from './NavTreeGroup.vue'
import NavTreeItem from './NavTreeItem.vue'

const parts = { NavTree, NavTreeGroup, NavTreeItem }

const meta = {
  title: 'Base/NavTree',
  // Top-aligned: centering would re-center the tree as groups open.
  parameters: { layout: 'padded' },
  render: () => ({
    components: parts,
    setup: () => ({ page: ref('intro') }),
    template: `
      <div class="flex gap-10">
        <NavTree v-model="page" class="w-60">
          <NavTreeItem value="intro">Introduction</NavTreeItem>
          <NavTreeItem value="install">Installation</NavTreeItem>
          <NavTreeGroup label="Components" default-open>
            <NavTreeItem value="button">Button</NavTreeItem>
            <NavTreeItem value="card">Card</NavTreeItem>
            <NavTreeItem value="popover">Popover</NavTreeItem>
            <NavTreeItem value="select">Select</NavTreeItem>
          </NavTreeGroup>
          <NavTreeGroup label="Guides">
            <NavTreeItem value="theming">Theming</NavTreeItem>
            <NavTreeItem value="motion">Motion</NavTreeItem>
          </NavTreeGroup>
        </NavTree>
        <p class="text-sm text-fg-muted">Active: {{ page }}</p>
      </div>`,
  }),
} satisfies Meta<typeof NavTree>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Groups inside groups, as in a course or a repository. */
export const Nested: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ page: ref('unit-1') }),
    template: `
      <NavTree v-model="page" class="w-64">
        <NavTreeGroup label="Web client" default-open>
          <NavTreeItem value="unit-1">Unit 1 · HTML</NavTreeItem>
          <NavTreeItem value="unit-2">Unit 2 · CSS</NavTreeItem>
          <NavTreeGroup label="Unit 3 · JavaScript">
            <NavTreeItem value="unit-3-1">Variables</NavTreeItem>
            <NavTreeItem value="unit-3-2">Functions</NavTreeItem>
            <NavTreeItem value="unit-3-3">The DOM</NavTreeItem>
          </NavTreeGroup>
        </NavTreeGroup>
        <NavTreeGroup label="Web server">
          <NavTreeItem value="php">PHP</NavTreeItem>
          <NavTreeItem value="laravel">Laravel</NavTreeItem>
        </NavTreeGroup>
      </NavTree>`,
  }),
}

/** Links: the active one is marked `aria-current="page"`, ready for a router. */
export const Links: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ page: ref('/docs') }),
    template: `
      <!-- Stops the story from navigating away. -->
      <div @click.prevent>
        <NavTree v-model="page" class="w-60">
          <NavTreeItem value="/docs" href="/docs">Docs</NavTreeItem>
          <NavTreeItem value="/blog" href="/blog">Blog</NavTreeItem>
          <NavTreeItem value="/changelog" href="/changelog">Changelog</NavTreeItem>
        </NavTree>
      </div>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** The active page sits in folded groups: they open on their own to show it. */
export const ActiveInsideFolded: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ page: ref('unit-3-2') }),
    template: `
      <NavTree v-model="page" class="w-64">
        <NavTreeGroup label="Web client">
          <NavTreeItem value="unit-1">Unit 1 · HTML</NavTreeItem>
          <NavTreeGroup label="Unit 3 · JavaScript">
            <NavTreeItem value="unit-3-1">Variables</NavTreeItem>
            <NavTreeItem value="unit-3-2">Functions</NavTreeItem>
          </NavTreeGroup>
        </NavTreeGroup>
        <NavTreeGroup label="Web server">
          <NavTreeItem value="php">PHP</NavTreeItem>
        </NavTreeGroup>
      </NavTree>`,
  }),
}

/** Labels much longer than in English wrap instead of overflowing. */
export const LongLabels: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ page: ref('a') }),
    template: `
      <NavTree v-model="page" class="w-52">
        <NavTreeItem value="a">Configuración de privacidad avanzada</NavTreeItem>
        <NavTreeGroup label="Notificaciones por correo electrónico y por el móvil" default-open>
          <NavTreeItem value="b">Resumen semanal de la actividad del proyecto</NavTreeItem>
          <NavTreeItem value="c">Menciones</NavTreeItem>
        </NavTreeGroup>
      </NavTree>`,
  }),
}

/** Many items: the tree scrolls with the page and the wave stops at the eighth. */
export const Many: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ page: ref('item-1') }),
    template: `
      <NavTree v-model="page" class="w-60">
        <NavTreeGroup v-for="g in 4" :key="g" :label="'Group ' + g" :default-open="g === 1">
          <NavTreeItem v-for="i in 12" :key="i" :value="'item-' + ((g - 1) * 12 + i)">Item {{ (g - 1) * 12 + i }}</NavTreeItem>
        </NavTreeGroup>
      </NavTree>`,
  }),
}

export const TwoInstances: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ a: ref('one'), b: ref('three') }),
    template: `
      <div class="flex gap-10">
        <NavTree v-model="a" label="First" class="w-48">
          <NavTreeItem value="one">One</NavTreeItem>
          <NavTreeItem value="two">Two</NavTreeItem>
        </NavTree>
        <NavTree v-model="b" label="Second" class="w-48">
          <NavTreeItem value="three">Three</NavTreeItem>
          <NavTreeItem value="four">Four</NavTreeItem>
        </NavTree>
      </div>`,
  }),
}
