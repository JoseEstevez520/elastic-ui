import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { NotebookPen, Plus, SearchX } from '@lucide/vue'
import Button from '../button/Button.vue'
import Card from '../card/Card.vue'
import CardContent from '../card/CardContent.vue'
import FileIcon from '../file-icon/FileIcon.vue'
import Empty from './Empty.vue'

const meta = {
  title: 'Content/Empty',
  component: Empty,
  args: { title: 'No notes yet' },
} satisfies Meta<typeof Empty>

export default meta
type Story = StoryObj<typeof meta>

/** An empty list of notes: the one thing to do next leads. */
export const Default: Story = {
  render: () => ({
    components: { Empty, Button, Plus },
    setup: () => ({ NotebookPen }),
    template: `
      <Empty :icon="NotebookPen" title="No notes yet" description="Notes you write for this unit will be here.">
        <template #actions><Button><Plus class="size-4" />New note</Button></template>
      </Empty>`,
  }),
}

/** A search that found nothing: say what was looked for, and a way back. */
export const NoResults: Story = {
  render: () => ({
    components: { Empty, Button },
    setup: () => ({ SearchX }),
    template: `
      <Empty :icon="SearchX" title="Nothing for “subneting”" description="Check the spelling, or search all units.">
        <template #actions><Button variant="ghost">Clear search</Button></template>
      </Empty>`,
  }),
}

/** Inside a Card, with a FileIcon as its object. */
export const InACard: Story = {
  render: () => ({
    components: { Empty, Button, Card, CardContent, FileIcon },
    template: `
      <Card class="w-96">
        <CardContent>
          <Empty title="No files handed in" description="Files students hand in for this practice show up here.">
            <template #icon><FileIcon name="practice-2.zip" class="size-12" /></template>
          </Empty>
        </CardContent>
      </Card>`,
  }),
}
