import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import Button from '../button/Button.vue'
import AnimatedList from './AnimatedList.vue'

const fruits = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry', 'Grapes', 'Lemon', 'Mango', 'Orange', 'Pineapple']

const meta = {
  title: 'Content/AnimatedList',
  // Top-aligned: centering would re-center the list as its height changes.
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Type to filter: the items that go fade out, then the rest slide up to close the gaps. */
export const Filter: Story = {
  render: () => ({
    components: { AnimatedList },
    setup() {
      const query = ref('')
      const shown = computed(() => fruits.filter((f) => f.toLowerCase().includes(query.value.toLowerCase())))
      return { query, shown }
    },
    template: `
      <div class="flex w-64 flex-col gap-3">
        <input
          v-model="query"
          placeholder="Filter fruits"
          class="h-10 rounded-md border border-border-strong bg-transparent px-3 text-sm text-fg outline-none focus-visible:outline-2 focus-visible:outline-accent"
        />
        <AnimatedList :items="shown" class="flex flex-col" item-class="py-2 text-sm text-fg">
          <template #default="{ item }">{{ item }}</template>
          <template #empty><p class="py-2 text-sm text-fg-muted">No fruit matches.</p></template>
        </AnimatedList>
      </div>`,
  }),
}

/**
 * Reorder: the items that change place fade out where they are and come into focus at their new
 * place as a wave, never sliding across one another.
 */
export const Sort: Story = {
  render: () => ({
    components: { AnimatedList, Button },
    setup() {
      const items = ref([...fruits])
      const shuffle = () => (items.value = [...items.value].sort(() => Math.random() - 0.5))
      const sort = () => (items.value = [...items.value].sort())
      return { items, shuffle, sort }
    },
    template: `
      <div class="flex w-64 flex-col gap-3">
        <div class="flex gap-2">
          <Button size="sm" variant="outline" @click="shuffle">Shuffle</Button>
          <Button size="sm" variant="ghost" @click="sort">A–Z</Button>
        </div>
        <AnimatedList :items="items" class="flex flex-col" item-class="py-2 text-sm text-fg">
          <template #default="{ item }">{{ item }}</template>
        </AnimatedList>
      </div>`,
  }),
}

/** Added items come in on their own; removed ones fade and the rest close the gap. */
export const AddRemove: Story = {
  render: () => ({
    components: { AnimatedList, Button },
    setup() {
      let next = 4
      const tasks = ref([1, 2, 3].map((id) => ({ id, title: `Task ${id}` })))
      const add = () => tasks.value.unshift({ id: next, title: `Task ${next++}` })
      const remove = (id: number) => (tasks.value = tasks.value.filter((t) => t.id !== id))
      return { tasks, add, remove }
    },
    template: `
      <div class="flex w-72 flex-col gap-3">
        <Button size="sm" class="self-start" @click="add">Add task</Button>
        <AnimatedList :items="tasks" :item-key="(t) => t.id" class="flex flex-col gap-2">
          <template #default="{ item }">
            <div class="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm text-fg">
              {{ item.title }}
              <Button size="sm" variant="ghost" @click="remove(item.id)">Remove</Button>
            </div>
          </template>
          <template #empty><p class="text-sm text-fg-muted">Nothing left to do.</p></template>
        </AnimatedList>
      </div>`,
  }),
}

/**
 * A grid of cards: removing one reflows the rest across rows, so they fade out and come into focus
 * at their new places rather than cutting across one another; shuffling does the same.
 */
export const Grid: Story = {
  render: () => ({
    components: { AnimatedList, Button },
    setup() {
      const items = ref([...fruits])
      const shuffle = () => (items.value = [...items.value].sort(() => Math.random() - 0.5))
      const drop = () => (items.value = items.value.slice(1))
      const reset = () => (items.value = [...fruits])
      return { items, shuffle, drop, reset }
    },
    template: `
      <div class="flex max-w-xl flex-col gap-3">
        <div class="flex gap-2">
          <Button size="sm" variant="outline" @click="shuffle">Shuffle</Button>
          <Button size="sm" variant="ghost" @click="drop">Remove first</Button>
          <Button size="sm" variant="ghost" @click="reset">Reset</Button>
        </div>
        <AnimatedList :items="items" as="div" class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <template #default="{ item }">
            <div class="rounded-lg border border-border p-4 text-sm text-fg">{{ item }}</div>
          </template>
        </AnimatedList>
      </div>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** Many items: only the first eight are staggered, the rest arrive with the eighth. */
export const Many: Story = {
  render: () => ({
    components: { AnimatedList },
    setup: () => ({ items: Array.from({ length: 40 }, (_, i) => `Item ${i + 1}`) }),
    template: `
      <AnimatedList :items="items" class="flex w-64 flex-col" item-class="py-1.5 text-sm text-fg">
        <template #default="{ item }">{{ item }}</template>
      </AnimatedList>`,
  }),
}

/** Items of different heights, with long text that wraps. */
export const MixedHeights: Story = {
  render: () => ({
    components: { AnimatedList, Button },
    setup() {
      const notes = ref([
        'Short note.',
        'A much longer note that wraps over several lines, to check that items of different heights change places cleanly.',
        'Another short one.',
        'Medium length note that takes about two lines at this width.',
      ])
      const reverse = () => (notes.value = [...notes.value].reverse())
      return { notes, reverse }
    },
    template: `
      <div class="flex w-72 flex-col gap-3">
        <Button size="sm" variant="outline" class="self-start" @click="reverse">Reverse</Button>
        <AnimatedList :items="notes" class="flex flex-col gap-2" item-class="rounded-md bg-bg-muted p-3 text-sm text-fg">
          <template #default="{ item }">{{ item }}</template>
        </AnimatedList>
      </div>`,
  }),
}
