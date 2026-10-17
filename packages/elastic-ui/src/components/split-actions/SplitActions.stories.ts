import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Bookmark, Download, Heart, Link, Mail, MessageCircle, Plus, Share2, Smile } from '@lucide/vue'
import SplitActions from './SplitActions.vue'

const share = [
  { label: 'Copy link', icon: Link },
  { label: 'Email', icon: Mail },
  { label: 'Download', icon: Download },
]

const meta = {
  title: 'Actions/SplitActions',
  component: SplitActions,
  args: { label: 'Share', icon: Share2, actions: share },
  render: (args) => ({
    components: { SplitActions },
    setup: () => ({ args }),
    template: `<div class="p-12"><SplitActions v-bind="args" /></div>`,
  }),
} satisfies Meta<typeof SplitActions>

export default meta
type Story = StoryObj<typeof meta>

/** Press Share: it lets go of its actions as drops, beside it. */
export const Row: Story = {}

const quick = [
  { label: 'Note', icon: MessageCircle },
  { label: 'Bookmark', icon: Bookmark },
  { label: 'Favourite', icon: Heart },
]

/** A round button that lets go of drops fanned out above it. */
export const Fan: Story = {
  args: { layout: 'fan', label: 'New', icon: Plus, actions: quick },
  render: (args) => ({
    components: { SplitActions },
    setup: () => ({ args }),
    template: `<div class="px-24 pt-32 pb-12"><SplitActions v-bind="args" /></div>`,
  }),
}

/** A round button that grows into a ring round itself, a segment per action; point at one to name it. */
export const Ring: Story = {
  args: { layout: 'ring', label: 'New', actions: [...quick, { label: 'New page', icon: Plus }] },
  render: (args) => ({
    components: { SplitActions },
    setup: () => ({ args }),
    template: `<div class="p-40"><SplitActions v-bind="args" /></div>`,
  }),
}

/** A round button that grows up into a split pill, where a floating button lives: a corner. */
export const Column: Story = {
  args: { layout: 'column', label: 'New', actions: [...quick, { label: 'New page', icon: Plus }] },
  render: (args) => ({
    components: { SplitActions },
    setup: () => ({ args }),
    template: `
      <div class="flex h-[26rem] w-80 items-end justify-end rounded-[var(--radius-xl)] bg-surface-raised p-6">
        <SplitActions v-bind="args" />
      </div>`,
  }),
}

/** The three round ones side by side, to choose: drops fanned, a ring, a column. */
export const RoundOnes: Story = {
  render: () => ({
    components: { SplitActions },
    setup: () => ({ quick, Plus }),
    template: `
      <div class="grid grid-cols-3 items-end gap-24 px-16 pt-56 pb-24">
        <div v-for="layout in ['fan', 'ring', 'column']" :key="layout" class="flex flex-col items-center gap-28">
          <SplitActions :layout="layout" label="New" :icon="Plus" :actions="quick" />
          <span class="text-meta text-fg-muted">{{ layout }}</span>
        </div>
      </div>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** Two actions only. */
export const TwoActions: Story = { args: { label: 'React', icon: Smile, actions: share.slice(0, 2) } }

/** Several on one row: each opens alone, and opening one closes the others by the click outside. */
export const InARow: Story = {
  render: (args) => ({
    components: { SplitActions },
    setup: () => ({ args }),
    template: `<div class="flex flex-col gap-4 p-12"><SplitActions v-for="n in 3" :key="n" v-bind="args" /></div>`,
  }),
}
