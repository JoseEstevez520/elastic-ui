import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Bookmark, Heart, MessageCircle, Plus } from '@lucide/vue'
import SplitActions from '../../components/split-actions/SplitActions.vue'
import RadialColumn from './RadialColumn.vue'
import RadialRing from './RadialRing.vue'

/**
 * Lab: SplitActions' radial redone. "Now" is the part as it is (loose drops fanned over the
 * button); "Ring" and "Column" make the actions one object split by tone, grown out of the button
 * where it is. Press each plus.
 */
const meta = { title: 'Lab/Radial', parameters: { layout: 'centered' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const actions = [
  { label: 'Note', icon: MessageCircle },
  { label: 'Bookmark', icon: Bookmark },
  { label: 'Favourite', icon: Heart },
]
const four = [...actions, { label: 'New page', icon: Plus }]

/** The three side by side: as it is, a ring, a column. */
export const Compare: Story = {
  render: () => ({
    components: { SplitActions, RadialRing, RadialColumn },
    setup: () => ({ actions, Plus }),
    template: `
      <div class="grid grid-cols-3 items-end gap-24 px-16 pt-56 pb-24">
        <div class="flex flex-col items-center gap-28">
          <SplitActions layout="radial" label="New" :icon="Plus" :actions="actions" />
          <span class="text-meta text-fg-muted">Now</span>
        </div>
        <div class="flex flex-col items-center gap-28">
          <RadialRing label="New" :actions="actions" />
          <span class="text-meta text-fg-muted">Ring</span>
        </div>
        <div class="flex flex-col items-center gap-28">
          <RadialColumn label="New" :actions="actions" />
          <span class="text-meta text-fg-muted">Column</span>
        </div>
      </div>`,
  }),
}

/** The ring alone, with four actions. */
export const Ring: Story = {
  render: () => ({
    components: { RadialRing },
    setup: () => ({ four }),
    template: `<div class="p-40"><RadialRing label="New" :actions="four" /></div>`,
  }),
}

/** The column alone, where a floating button lives: the bottom right of a page. */
export const Column: Story = {
  render: () => ({
    components: { RadialColumn },
    setup: () => ({ four }),
    template: `<div class="flex h-[26rem] w-80 items-end justify-end rounded-[var(--radius-xl)] bg-surface-raised p-6"><RadialColumn label="New" :actions="four" /></div>`,
  }),
}
