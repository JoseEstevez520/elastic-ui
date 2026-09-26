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

/** A round button whose actions fan out above it, as a floating button's. */
export const Radial: Story = {
  args: {
    layout: 'radial',
    label: 'New',
    icon: Plus,
    actions: [
      { label: 'Note', icon: MessageCircle },
      { label: 'Bookmark', icon: Bookmark },
      { label: 'Favourite', icon: Heart },
    ],
  },
  render: (args) => ({
    components: { SplitActions },
    setup: () => ({ args }),
    template: `<div class="px-24 pt-32 pb-12"><SplitActions v-bind="args" /></div>`,
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
