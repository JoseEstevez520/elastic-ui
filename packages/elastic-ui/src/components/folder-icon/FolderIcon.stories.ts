import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Button from '../button/Button.vue'
import FolderIcon from './FolderIcon.vue'

const meta = {
  title: 'Content/FolderIcon',
  component: FolderIcon,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof FolderIcon>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Open or closed, the front flap folds. */
export const Toggle: Story = {
  render: () => ({
    components: { FolderIcon, Button },
    setup: () => ({ open: ref(false) }),
    template: `<div class="flex flex-col items-center gap-4"><FolderIcon size="lg" :open="open" color="#2563eb" /><Button variant="ghost" @click="open = !open">{{ open ? 'Close' : 'Open' }}</Button></div>`,
  }),
}

/** Tinted in any colour; the neutral grey when none is given. */
export const Colours: Story = {
  render: () => ({
    components: { FolderIcon },
    setup: () => ({ colours: [undefined, '#2563eb', '#0d9488', '#7c3aed', '#d97706', '#c026d3', '#65a30d', '#e11d48'] }),
    template: `<div class="flex gap-3"><FolderIcon v-for="c in colours" :key="c ?? 'none'" size="lg" :color="c" /><FolderIcon size="lg" color="#2563eb" open /></div>`,
  }),
}

/** Situation, size: the four sizes. */
export const Sizes: Story = {
  render: () => ({
    components: { FolderIcon },
    template: `<div class="flex items-end gap-4"><FolderIcon size="xs" color="#0d9488" /><FolderIcon size="sm" color="#0d9488" /><FolderIcon size="md" color="#0d9488" /><FolderIcon size="lg" color="#0d9488" /></div>`,
  }),
}

/** Situation, coexistence: several on one page, each its own. */
export const Two: Story = {
  render: () => ({
    components: { FolderIcon },
    template: `<div class="flex gap-3"><FolderIcon size="lg" open color="#d97706" /><FolderIcon size="lg" color="#7c3aed" /><FolderIcon size="lg" open /></div>`,
  }),
}
