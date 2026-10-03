import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Folder } from '@lucide/vue'
import { computed, ref } from 'vue'
import Button from '../button/Button.vue'
import Popover from '../popover/Popover.vue'
import PopoverContent from '../popover/PopoverContent.vue'
import PopoverTrigger from '../popover/PopoverTrigger.vue'
import NavTree from './NavTree.vue'
import NavTreeGroup from './NavTreeGroup.vue'
import NavTreeItem from './NavTreeItem.vue'

const parts = { NavTree, NavTreeGroup, NavTreeItem }

const meta = {
  title: 'Navigation/NavTree',
  // Top-aligned: centering would re-center the tree as groups open.
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

/**
 * A tree to pick a place from (`selectable`): items, and groups with a `value`, are options rather
 * than links. A group's label picks it and its chevron folds it. It is announced as a tree, the
 * chosen row `aria-selected`; Tab reaches one row, the arrows move between rows and fold groups,
 * Enter or Space picks.
 */
export const Selectable: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ place: ref('unit-2') }),
    template: `
      <div class="flex gap-10">
        <NavTree v-model="place" selectable label="Where it goes" class="w-64">
          <NavTreeItem value="unsure">Not sure</NavTreeItem>
          <NavTreeGroup label="Web client" value="web-client" default-open>
            <NavTreeItem value="unit-1">Unit 1 · HTML</NavTreeItem>
            <NavTreeItem value="unit-2">Unit 2 · CSS</NavTreeItem>
            <NavTreeGroup label="Unit 3 · JavaScript" value="unit-3">
              <NavTreeItem value="unit-3-1">Variables</NavTreeItem>
              <NavTreeItem value="unit-3-2">Functions</NavTreeItem>
            </NavTreeGroup>
          </NavTreeGroup>
          <NavTreeGroup label="Web server" value="web-server">
            <NavTreeItem value="php">PHP</NavTreeItem>
            <NavTreeItem value="laravel">Laravel</NavTreeItem>
          </NavTreeGroup>
        </NavTree>
        <p class="text-sm text-fg-muted">Chosen: {{ place }}</p>
      </div>`,
  }),
}

/**
 * The picker in a Popover, from a quiet button in a bar: picking a place emits `select`, which
 * closes the popover, and the button says where it goes. The chosen row is marked as the panel
 * grows in, measured in the panel's own units so the scale-in never moves it off.
 */
export const PickerInPopover: Story = {
  render: () => ({
    components: { ...parts, Button, Popover, PopoverTrigger, PopoverContent },
    setup: () => {
      const names: Record<string, string> = {
        unsure: 'Not sure',
        'web-client': 'Web client',
        'unit-1': 'Unit 1 · HTML',
        'unit-2': 'Unit 2 · CSS',
        'web-server': 'Web server',
        php: 'PHP',
      }
      const place = ref<string>()
      const open = ref(false)
      return { place, open, Folder, shown: computed(() => (place.value ? names[place.value] : 'Where does it go?')) }
    },
    template: `
      <div class="flex justify-end">
        <Popover v-model:open="open">
          <PopoverTrigger as-child>
            <Button variant="ghost" size="sm" :icon="Folder">{{ shown }}</Button>
          </PopoverTrigger>
          <PopoverContent align="end" fluid>
            <NavTree v-model="place" selectable label="Where it goes" @select="open = false">
              <NavTreeItem value="unsure">Not sure</NavTreeItem>
              <NavTreeGroup label="Web client" value="web-client">
                <NavTreeItem value="unit-1">Unit 1 · HTML</NavTreeItem>
                <NavTreeItem value="unit-2">Unit 2 · CSS</NavTreeItem>
              </NavTreeGroup>
              <NavTreeGroup label="Web server" value="web-server">
                <NavTreeItem value="php">PHP</NavTreeItem>
              </NavTreeGroup>
            </NavTree>
          </PopoverContent>
        </Popover>
      </div>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/**
 * The active page sits in folded groups: they open on their own to show it. On load they are simply
 * open, with no animation; only a later change of page opens a group with its wave.
 */
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

/**
 * Groups that are pages of their own, as a documentation site's sections: the label goes to the
 * section's index (`value` and `to` or `href`), and only the chevron folds the group. Going to a
 * section opens it. With a router, pass `to` and the items render the app's RouterLink.
 */
export const GroupPages: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ page: ref('modules') }),
    template: `
      <div class="flex gap-10">
        <NavTree v-model="page" class="w-64">
          <NavTreeItem value="home" href="#home">Home</NavTreeItem>
          <NavTreeGroup label="Modules" value="modules" href="#modules" default-open>
            <NavTreeItem value="web-client" href="#web-client">Web client</NavTreeItem>
            <NavTreeItem value="web-server" href="#web-server">Web server</NavTreeItem>
            <NavTreeGroup label="Design" value="design" href="#design">
              <NavTreeItem value="colour" href="#colour">Colour</NavTreeItem>
              <NavTreeItem value="type" href="#type">Type</NavTreeItem>
            </NavTreeGroup>
          </NavTreeGroup>
          <NavTreeGroup label="Tools" value="tools" href="#tools">
            <NavTreeItem value="git" href="#git">Git</NavTreeItem>
            <NavTreeItem value="docker" href="#docker">Docker</NavTreeItem>
          </NavTreeGroup>
        </NavTree>
        <p class="text-sm text-fg-muted">Active: {{ page }}</p>
      </div>`,
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
