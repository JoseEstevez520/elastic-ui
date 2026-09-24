import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { LayoutGrid, List } from '@lucide/vue'
import { computed, ref } from 'vue'
import AnimatedList from '../animated-list/AnimatedList.vue'
import SegmentedControl from './SegmentedControl.vue'
import SegmentedControlItem from './SegmentedControlItem.vue'

const RESOURCES = [
  { name: 'MDN Web Docs', kind: 'docs' },
  { name: 'Vue', kind: 'docs' },
  { name: 'Figma', kind: 'tools' },
  { name: 'Excalidraw', kind: 'tools' },
  { name: 'The Odin Project', kind: 'courses' },
  { name: 'freeCodeCamp', kind: 'courses' },
]

const meta = {
  title: 'Base/SegmentedControl',
  component: SegmentedControl,
  render: () => ({
    components: { AnimatedList, SegmentedControl, SegmentedControlItem },
    setup() {
      const kind = ref('all')
      const shown = computed(() => RESOURCES.filter((r) => kind.value === 'all' || r.kind === kind.value))
      return { kind, shown }
    },
    template: `
      <div class="flex w-80 flex-col gap-4">
        <SegmentedControl v-model="kind" label="Show">
          <SegmentedControlItem value="all">All</SegmentedControlItem>
          <SegmentedControlItem value="docs">Docs</SegmentedControlItem>
          <SegmentedControlItem value="tools">Tools</SegmentedControlItem>
          <SegmentedControlItem value="courses">Courses</SegmentedControlItem>
        </SegmentedControl>
        <AnimatedList :items="shown" :item-key="(r) => r.name" class="flex flex-col gap-1">
          <template #default="{ item }"><p class="text-sm">{{ item.name }}</p></template>
        </AnimatedList>
      </div>`,
  }),
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A filter over a list: the selected surface slides to the next option, taking its width, while
 * the list below rearranges. Arrow keys move between the options.
 */
export const Default: Story = {}

/** With icons, as a switch between two views of the same content. */
export const Icons: Story = {
  render: () => ({
    components: { SegmentedControl, SegmentedControlItem },
    setup: () => ({ view: ref('grid'), icons: { LayoutGrid, List } }),
    template: `
      <SegmentedControl v-model="view" label="View">
        <SegmentedControlItem value="grid" :icon="icons.LayoutGrid">Grid</SegmentedControlItem>
        <SegmentedControlItem value="list" :icon="icons.List">List</SegmentedControlItem>
      </SegmentedControl>`,
  }),
}
