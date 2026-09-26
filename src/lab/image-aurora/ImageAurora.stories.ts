import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import ImageAurora from './ImageAurora.vue'

// Photos of different colour: warm autumn, cool sea, green forest, a nearly grey city.
const photos = [
  { src: 'https://picsum.photos/id/1015/800/600', title: 'River valley', kind: 'Photography' },
  { src: 'https://picsum.photos/id/1036/800/600', title: 'Winter light', kind: 'Photography' },
  { src: 'https://picsum.photos/id/1043/800/600', title: 'Old town', kind: 'Travel' },
  { src: 'https://picsum.photos/id/1080/800/600', title: 'Strawberries', kind: 'Food' },
]

const meta = {
  title: 'Lab/Image aurora',
  component: ImageAurora,
  parameters: { layout: 'fullscreen' },
  args: { src: photos[0]!.src },
} satisfies Meta<typeof ImageAurora>

export default meta
type Story = StoryObj<typeof meta>

// A project card: the photo, and under it the card's own ground, glowing in the photo's colours.
const cards = (look: string, vivid: boolean) => ({
  components: { ImageAurora },
  setup: () => ({ photos, look, vivid }),
  template: `
    <div class="grid gap-6 p-8 sm:grid-cols-2">
      <ImageAurora v-for="p in photos" :key="p.src" :src="p.src" :look="look" :vivid="vivid" class="rounded-[var(--radius-xl,1.5rem)] border border-[color:var(--color-border)]">
        <div class="p-3">
          <img :src="p.src" alt="" crossorigin="anonymous" class="aspect-[4/3] w-full rounded-[var(--radius-lg)] object-cover" />
        </div>
        <div class="px-5 pt-2 pb-5">
          <p class="text-xs font-medium text-fg-muted">{{ p.kind }}</p>
          <h3 class="mt-1 text-lg font-semibold text-fg">{{ p.title }}</h3>
          <p class="mt-2 text-sm text-fg-secondary">A few lines about the project, to see how text reads on its colour.</p>
        </div>
      </ImageAurora>
    </div>`,
})

/** A: the Aurora's lights, from each photo's colours. Soft. */
export const CardsLights: Story = { render: () => cards('lights', false) }

/** A, livelier. */
export const CardsLightsVivid: Story = { render: () => cards('lights', true) }

/** B: the photo itself, blurred and turning slowly, as Apple Music's player. */
export const CardsArtwork: Story = { render: () => cards('artwork', false) }

/** B, livelier. */
export const CardsArtworkVivid: Story = { render: () => cards('artwork', true) }

/** A player, where Apple Music does it: changing the track, the colour follows the artwork. */
export const NowPlaying: Story = {
  render: () => ({
    components: { ImageAurora },
    setup: () => {
      const i = ref(0)
      return { photos, i, next: () => (i.value = (i.value + 1) % photos.length) }
    },
    template: `
      <div class="grid min-h-screen place-items-center p-6">
        <ImageAurora :src="photos[i].src" look="artwork" class="w-80 rounded-[2rem] border border-[color:var(--color-border)]">
          <div class="flex flex-col items-center gap-5 p-6">
            <img :src="photos[i].src" alt="" crossorigin="anonymous" class="aspect-square w-full rounded-2xl object-cover shadow-soft" />
            <div class="text-center">
              <p class="font-semibold text-fg">{{ photos[i].title }}</p>
              <p class="text-sm text-fg-muted">{{ photos[i].kind }}</p>
            </div>
            <button class="h-9 cursor-pointer rounded-full bg-[color:var(--color-fg)] px-4 text-sm font-medium text-[color:var(--color-bg)]" @click="next">Next</button>
          </div>
        </ImageAurora>
      </div>`,
  }),
}
