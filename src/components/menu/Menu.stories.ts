import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Archive, Copy, FolderInput, Link, Pencil, Share2, Trash2 } from '@lucide/vue'
import { ref } from 'vue'
import Button from '../button/Button.vue'
import Menu from './Menu.vue'
import MenuCheckboxItem from './MenuCheckboxItem.vue'
import MenuContent from './MenuContent.vue'
import MenuGroup from './MenuGroup.vue'
import MenuItem from './MenuItem.vue'
import MenuLabel from './MenuLabel.vue'
import MenuRadioGroup from './MenuRadioGroup.vue'
import MenuRadioItem from './MenuRadioItem.vue'
import MenuSeparator from './MenuSeparator.vue'
import MenuSub from './MenuSub.vue'
import MenuSubContent from './MenuSubContent.vue'
import MenuSubTrigger from './MenuSubTrigger.vue'
import MenuTrigger from './MenuTrigger.vue'

const parts = {
  Button,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuGroup,
  MenuLabel,
  MenuSeparator,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
}
// The library ships no icons; Lucide stands in for a project's own.
const icons = { Archive, Copy, FolderInput, Link, Pencil, Share2, Trash2 }

const meta = {
  title: 'Base/Menu',
  render: () => ({
    components: parts,
    setup: () => ({ icons }),
    template: `
      <Menu>
        <MenuTrigger as-child><Button variant="outline">Actions</Button></MenuTrigger>
        <MenuContent>
          <MenuItem :icon="icons.Pencil" shortcut="⌘R">Rename</MenuItem>
          <MenuItem :icon="icons.Copy" shortcut="⌘D">Duplicate</MenuItem>
          <MenuItem :icon="icons.FolderInput">Move to…</MenuItem>
          <MenuSeparator />
          <MenuItem :icon="icons.Archive">Archive</MenuItem>
          <MenuItem :icon="icons.Trash2" shortcut="⌫">Delete</MenuItem>
        </MenuContent>
      </Menu>`,
  }),
} satisfies Meta<typeof Menu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Options that stay: checks that toggle, and one choice among several. */
export const Choices: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ grid: ref(true), minimap: ref(false), density: ref('comfortable') }),
    template: `
      <div class="flex items-start gap-6">
        <Menu>
          <MenuTrigger as-child><Button variant="outline">View</Button></MenuTrigger>
          <MenuContent>
            <MenuLabel>Show</MenuLabel>
            <MenuCheckboxItem v-model="grid">Grid</MenuCheckboxItem>
            <MenuCheckboxItem v-model="minimap">Minimap</MenuCheckboxItem>
            <MenuSeparator />
            <MenuLabel>Density</MenuLabel>
            <MenuRadioGroup v-model="density">
              <MenuRadioItem value="compact">Compact</MenuRadioItem>
              <MenuRadioItem value="comfortable">Comfortable</MenuRadioItem>
              <MenuRadioItem value="spacious">Spacious</MenuRadioItem>
            </MenuRadioGroup>
          </MenuContent>
        </Menu>
        <p class="text-sm text-fg-muted">Grid {{ grid ? 'on' : 'off' }}, minimap {{ minimap ? 'on' : 'off' }}, {{ density }}.</p>
      </div>`,
  }),
}

/** A submenu opens to the side, lined up with the item that opens it. */
export const Submenu: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ icons }),
    template: `
      <Menu>
        <MenuTrigger as-child><Button variant="outline">File</Button></MenuTrigger>
        <MenuContent>
          <MenuItem :icon="icons.Pencil">Rename</MenuItem>
          <MenuSub>
            <MenuSubTrigger :icon="icons.Share2">Share</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem :icon="icons.Link">Copy link</MenuItem>
              <MenuItem>By email</MenuItem>
              <MenuItem>To the class group</MenuItem>
            </MenuSubContent>
          </MenuSub>
          <MenuSeparator />
          <MenuGroup>
            <MenuLabel>Danger zone</MenuLabel>
            <MenuItem :icon="icons.Trash2">Delete</MenuItem>
          </MenuGroup>
        </MenuContent>
      </Menu>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

export const Disabled: Story = {
  render: () => ({
    components: parts,
    template: `
      <Menu>
        <MenuTrigger as-child><Button variant="outline">Edit</Button></MenuTrigger>
        <MenuContent>
          <MenuItem shortcut="⌘Z">Undo</MenuItem>
          <MenuItem disabled shortcut="⇧⌘Z">Redo (nothing to redo)</MenuItem>
        </MenuContent>
      </Menu>`,
  }),
}

/** Near the bottom of the screen it opens upwards, and its wave runs from the trigger up. */
export const OpensUpwards: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: parts,
    setup: () => ({ icons }),
    template: `
      <div class="flex h-screen items-end p-4">
        <Menu>
          <MenuTrigger as-child><Button variant="outline">Actions</Button></MenuTrigger>
          <MenuContent>
            <MenuItem :icon="icons.Pencil">Rename</MenuItem>
            <MenuItem :icon="icons.Copy">Duplicate</MenuItem>
            <MenuItem :icon="icons.Archive">Archive</MenuItem>
          </MenuContent>
        </Menu>
      </div>`,
  }),
}

/** More items than fit: the menu scrolls inside, and skips the wave. */
export const ManyItems: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ items: Array.from({ length: 40 }, (_, i) => `Project ${i + 1}`) }),
    template: `
      <Menu>
        <MenuTrigger as-child><Button variant="outline">Open project</Button></MenuTrigger>
        <MenuContent>
          <MenuItem v-for="item in items" :key="item">{{ item }}</MenuItem>
        </MenuContent>
      </Menu>`,
  }),
}

/** Labels much longer than in English: the menu grows wider rather than wrapping. */
export const LongLabels: Story = {
  render: () => ({
    components: parts,
    template: `
      <Menu>
        <MenuTrigger as-child><Button variant="outline">Opciones</Button></MenuTrigger>
        <MenuContent>
          <MenuItem shortcut="⌘P">Configuración de privacidad avanzada</MenuItem>
          <MenuItem>Notificaciones por correo electrónico</MenuItem>
        </MenuContent>
      </Menu>`,
  }),
}
