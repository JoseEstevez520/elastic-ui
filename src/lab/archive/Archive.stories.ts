import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ConfirmButton from '../../components/confirm-button/ConfirmButton.vue'
import ArchiveIcon from './ArchiveIcon.vue'

/**
 * Lab: archive, the bin's sibling. The same square that asks in its own place, with a box of
 * records: its lid lifts straight up as it asks and comes down as it is done. Neutral, since an
 * archive can be undone: no danger colour anywhere.
 */
const meta = { title: 'Lab/Archive', parameters: { layout: 'centered' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** Beside the bin, to compare the two gestures: the lid tipping back on its hinge, the lid lifted off. */
export const BesideTheBin: Story = {
  render: () => ({
    components: { ConfirmButton },
    setup: () => ({ ArchiveIcon, action: () => wait(900) }),
    template: `
      <div class="flex items-center gap-6">
        <ConfirmButton :action="action" />
        <ConfirmButton :action="action" :icon="ArchiveIcon" tone="neutral" label="Archive" />
      </div>`,
  }),
}

/** At the end of each row, where it is used. */
export const InAList: Story = {
  render: () => ({
    components: { ConfirmButton },
    setup: () => ({ ArchiveIcon, action: () => wait(900) }),
    template: `
      <ul class="w-96 divide-y divide-border">
        <li v-for="name in ['Unit 2, networks', 'Practice 1', 'Old exam notes']" :key="name" class="flex items-center justify-between py-2">
          <span class="text-label text-fg">{{ name }}</span>
          <ConfirmButton :action="action" :icon="ArchiveIcon" tone="neutral" :label="'Archive ' + name" />
        </li>
      </ul>`,
  }),
}
