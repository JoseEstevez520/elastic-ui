import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ImageView from './ImageView.vue'

const meta = { title: 'Content/ImageView', component: ImageView, args: { src: '', alt: '' } } satisfies Meta<
  typeof ImageView
>
export default meta
type Story = StoryObj<typeof meta>

/** Press a photo: it grows from its place into full view, its crop opening out; press again or Escape. */
export const InNotes: Story = {
  render: () => ({
    components: { ImageView },
    template: `
      <article class="prose article py-10">
        <h2>Deploying on a server</h2>
        <p>The diagram below shows where each part runs once the site is live.</p>
        <ImageView src="https://picsum.photos/id/1043/1600/1000" alt="A walk through old streets" caption="Figure 1. Where each part of the site runs." class="aspect-[16/9] w-full rounded-[var(--radius-lg)] object-cover" />
        <p>Two photos side by side, cropped square in the text:</p>
        <div class="grid grid-cols-2 gap-4">
          <ImageView src="https://picsum.photos/id/1036/1000/1400" alt="Winter light" class="aspect-square w-full rounded-[var(--radius-lg)] object-cover" />
          <ImageView src="https://picsum.photos/id/1080/1400/900" alt="Market" caption="A greengrocer's stall." class="aspect-square w-full rounded-[var(--radius-lg)] object-cover" />
        </div>
      </article>`,
  }),
}

/** A clip: the thumbnail plays it muted and in a loop (`src` is its poster); pressed, it opens with its controls. */
export const Video: Story = {
  args: {
    src: 'https://picsum.photos/id/1043/1600/1000',
    video: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    alt: 'A flower opening',
    caption: 'A clip that opens where it is.',
  },
  render: (args) => ({
    components: { ImageView },
    setup: () => ({ args }),
    template: `<div class="mx-auto max-w-xl"><ImageView v-bind="args" class="w-full rounded-[var(--radius-lg)]" /></div>`,
  }),
}
