import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Button from '../button/Button.vue'
import RankedList from './RankedList.vue'
import type { RankedListItem } from './ranked-list.types'

const meta = {
  title: 'Content/RankedList',
  component: RankedList,
  args: {
    label: 'Products empty today',
    options: { style: 'percent' },
    max: 1,
    items: [
      { key: 'dairy', label: 'Dairy', value: 0.62 },
      { key: 'fruit', label: 'Fruit', value: 0.41 },
      { key: 'bread', label: 'Bread', value: 0.28 },
      { key: 'drinks', label: 'Drinks', value: 0.17 },
      { key: 'canned', label: 'Canned goods', value: 0.06 },
    ],
  },
  decorators: [() => ({ template: '<div class="w-[28rem] max-w-full"><story /></div>' })],
} satisfies Meta<typeof RankedList>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

const products = [
  { key: 'dairy', label: 'Dairy', share: 0.62, times: 5, day: [1, 1, 3, 3, 3, 3, 2, 1, 0, 1, 2, 1, 0] },
  { key: 'fruit', label: 'Fruit', share: 0.41, times: 9, day: [0, 0, 1, 1, 0, 0, 1, 2, 2, 3, 3, 2, 1] },
  { key: 'bread', label: 'Bread', share: 0.28, times: 3, day: [3, 2, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0] },
  { key: 'drinks', label: 'Drinks', share: 0.17, times: 11, day: [0, 0, 0, 1, 0, 0, 2, 0, 0, 2, 0, 0, 2] },
  { key: 'canned', label: 'Canned goods', share: 0.06, times: 2, day: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0] },
]
// A tray is a tone off the page, so what sits on it steps further from it: the empty cell is a
// veil of the text colour, and the red climbs from 55% so every step stands out from the tray.
const tone = ['bg-fg/10', 'bg-danger/55', 'bg-danger/75', 'bg-danger/95']
const level = ['not empty', 'empty a little', 'empty for a while', 'empty most of the time']

/** Changing what the list measures re-sorts it, but the rows stay where they are: the name and
 * the figure in each place turn into the new ones, and the fill eases to its new length. */
export const ChangingTheMeasure: Story = {
  render: () => ({
    components: { Button, RankedList },
    setup() {
      const by = ref<'share' | 'times'>('share')
      const items = () =>
        [...products]
          .sort((a, b) => b[by.value] - a[by.value])
          .map((p): RankedListItem => ({ key: p.key, label: p.label, value: p[by.value] }))
      return { by, items }
    },
    template: `
      <div class="flex flex-col gap-3">
        <div class="flex gap-1">
          <Button size="sm" :variant="by === 'share' ? 'outline' : 'ghost'" @click="by = 'share'">Share of the day</Button>
          <Button size="sm" :variant="by === 'times' ? 'outline' : 'ghost'" @click="by = 'times'">Times empty</Button>
        </div>
        <RankedList
          :items="items()"
          :max="by === 'share' ? 1 : 14"
          :options="by === 'share' ? { style: 'percent' } : {}"
          label="Products empty today"
        />
      </div>`,
  }),
}

/** With a `detail` slot a row opens in place, one at a time, to show how that product went. */
export const OpeningARow: Story = {
  render: () => ({
    components: { RankedList },
    setup: () => ({
      open: ref<string | null>(null),
      items: products.map((p): RankedListItem => ({ key: p.key, label: p.label, value: p.share })),
      byKey: Object.fromEntries(products.map((p) => [p.key, p])),
      tone,
      level,
    }),
    template: `
      <RankedList v-model="open" :items="items" :max="1" :options="{ style: 'percent' }" label="Products empty today">
        <template #detail="{ item }">
          <p class="mb-2 text-meta text-fg-secondary">How the day went</p>
          <div class="grid grid-cols-13 gap-[3px]" style="grid-template-columns: repeat(13, minmax(0, 1fr))">
            <i v-for="(d, k) in byKey[item.key].day" :key="k" class="h-5 rounded-[4px]" :class="tone[d]" :title="level[d]" />
          </div>
        </template>
      </RankedList>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** One row on its own. */
export const OneItem: Story = {
  args: { items: [{ key: 'dairy', label: 'Dairy', value: 0.62 }] },
}

/** Two rows. */
export const TwoItems: Story = {
  args: {
    items: [
      { key: 'dairy', label: 'Dairy', value: 0.62 },
      { key: 'fruit', label: 'Fruit', value: 0.41 },
    ],
  },
}

/** Many rows, with `max` left out: the largest fills its row and the others are measured on it. */
export const ManyItems: Story = {
  args: {
    max: undefined,
    items: Array.from({ length: 14 }, (_, i) => ({ key: `k${i}`, label: `Product ${i + 1}`, value: 140 - i * 9 })),
    options: {},
  },
}

/** Nothing to rank yet: no rows, no error. */
export const NoItems: Story = {
  args: { items: [] },
}

/** Values that are all zero: empty trays, not a division by zero. */
export const AllZero: Story = {
  args: {
    max: undefined,
    options: {},
    items: [
      { key: 'a', label: 'Dairy', value: 0 },
      { key: 'b', label: 'Fruit', value: 0 },
    ],
  },
}

/** A narrow column, as on a phone. */
export const PhoneWidth: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  decorators: [() => ({ template: '<div class="w-64"><story /></div>' })],
}

/** Two lists on one page open independently. */
export const TwoOnOnePage: Story = {
  render: () => ({
    components: { RankedList },
    setup: () => ({
      a: ref<string | null>('dairy'),
      b: ref<string | null>(null),
      items: products.map((p): RankedListItem => ({ key: p.key, label: p.label, value: p.share })),
    }),
    template: `
      <div class="flex flex-col gap-8">
        <RankedList v-model="a" :items="items" :max="1" :options="{ style: 'percent' }" label="Today">
          <template #detail="{ item }"><p class="pb-1 text-fg-secondary">{{ item.label }} today</p></template>
        </RankedList>
        <RankedList v-model="b" :items="items" :max="1" :options="{ style: 'percent' }" label="Yesterday">
          <template #detail="{ item }"><p class="pb-1 text-fg-secondary">{{ item.label }} yesterday</p></template>
        </RankedList>
      </div>`,
  }),
}
