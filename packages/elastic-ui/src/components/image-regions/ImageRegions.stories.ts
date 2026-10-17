import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import ImageRegions from './ImageRegions.vue'
import type { ImageRegion } from './image-regions.types'

// A drawn shelf stands in for a photo, so the story needs no file.
const shelf = (() => {
  const boards = [40, 150, 260].map((y) => `<rect x="30" y="${y}" width="580" height="8" fill="#c4c7bd"/>`).join('')
  const goods = [
    [50, 70, 40, 80], [100, 85, 40, 65], [150, 70, 40, 80], [260, 95, 46, 55], [316, 95, 46, 55],
    [50, 180, 50, 80], [110, 180, 50, 80], [170, 180, 50, 80], [420, 190, 50, 70], [480, 190, 50, 70], [540, 190, 50, 70],
  ]
    .map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#aeb3a6"/>`)
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="#d6d8d0"/>${boards}${goods}</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
})()

const box = (x1: number, y1: number, x2: number, y2: number): [number, number][] => [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]
const regions: ImageRegion[] = [
  { key: 'dairy', label: 'Dairy', description: 'Empty since 10:40', tone: 'danger', points: box(48, 66, 196, 152) },
  { key: 'yogurt', label: 'Yogurt', description: 'Fine, 80% full', tone: 'success', points: box(255, 92, 366, 152) },
  { key: 'fruit', label: 'Fruit', description: 'There is bread in this spot', tone: 'warning', points: box(48, 178, 224, 262) },
  { key: 'drinks', label: 'Drinks', description: 'Fine, 65% full', tone: 'success', points: box(416, 186, 596, 262) },
]

const meta = {
  title: 'Content/ImageRegions',
  component: ImageRegions,
  args: { src: shelf, alt: 'A shelf with four marked places', width: 640, height: 360, regions },
  decorators: [() => ({ template: '<div class="w-[40rem] max-w-full"><story /></div>' })],
} satisfies Meta<typeof ImageRegions>
export default meta
type Story = StoryObj<typeof meta>

/** Each place has a small glass mark. Press a place (or its mark, or Tab to it and press Enter):
 * the mark grows in place into its card. Pressing again, Escape, or anywhere else folds it back. */
export const Default: Story = {}

/** `v-model` is the key of the open region, so the page can open one itself. */
export const StartingOpen: Story = {
  render: (args) => ({
    components: { ImageRegions },
    setup: () => ({ args, open: ref<string | null>('dairy') }),
    template: '<ImageRegions v-bind="args" v-model="open" />',
  }),
}

/** The `region` slot is the card's content, for more than a name. */
export const OwnContent: Story = {
  render: (args) => ({
    components: { ImageRegions },
    setup: () => ({ args }),
    template: `
      <ImageRegions v-bind="args" style="--image-regions-card-height: 7rem">
        <template #region="{ region }">
          <p class="flex h-7 items-center pl-6 font-medium">{{ region.label }}</p>
          <p class="text-ui text-fg-secondary">{{ region.description }}</p>
          <p class="mt-1 text-meta text-fg-muted">Last photo 10:30</p>
        </template>
      </ImageRegions>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** No picture: a flat tray, and the regions still work. */
export const WithoutPicture: Story = { args: { src: undefined } }

/** One region. */
export const OneRegion: Story = { args: { regions: [regions[0]!] } }

/** Regions at every corner: each card grows towards the room there is and stays inside the picture. */
export const NearTheEdges: Story = {
  args: {
    regions: [
      { key: 'a', label: 'Top left', description: 'Grows right', tone: 'neutral', points: box(4, 4, 90, 60) },
      { key: 'b', label: 'Top right', description: 'Grows left', tone: 'neutral', points: box(550, 4, 636, 60) },
      { key: 'c', label: 'Bottom left', description: 'Held above the edge', tone: 'neutral', points: box(4, 300, 90, 356) },
      { key: 'd', label: 'Bottom right', description: 'Held above the edge', tone: 'neutral', points: box(550, 300, 636, 356) },
    ],
  },
}

/** A phone: the card never wider than the picture. */
export const PhoneWidth: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  decorators: [() => ({ template: '<div class="w-72"><story /></div>' })],
}

/** Two pictures on one page open independently. */
export const TwoOnOnePage: Story = {
  render: (args) => ({
    components: { ImageRegions },
    setup: () => ({ args, a: ref<string | null>('dairy'), b: ref<string | null>(null) }),
    template: `
      <div class="flex flex-col gap-8">
        <ImageRegions v-bind="args" v-model="a" />
        <ImageRegions v-bind="args" v-model="b" />
      </div>`,
  }),
}
