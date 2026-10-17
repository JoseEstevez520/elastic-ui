import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Figure from './Figure.vue'

const meta = { title: 'Content/Figure', component: Figure, parameters: { layout: 'padded' } } satisfies Meta<typeof Figure>
export default meta
type Story = StoryObj<typeof meta>

/** A picture with its caption under it. Press the picture: it grows where it is, the caption under it there too. */
export const Default: Story = {
  render: () => ({
    components: { Figure },
    template: `
      <div class="mx-auto max-w-xl">
        <Figure
          src="https://picsum.photos/id/1043/1600/1000"
          alt="Old streets in the evening light"
          caption="The old town, a Sunday afternoon."
        />
      </div>`,
  }),
}

/** A clip: it plays muted and in a loop, and pressed it opens with its controls, from where it had got to. */
export const WithVideo: Story = {
  render: () => ({
    components: { Figure },
    template: `
      <div class="mx-auto max-w-xl">
        <Figure
          video="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
          src="https://picsum.photos/id/1043/1600/1000"
          alt="A flower opening"
          caption="A clip, with the same caption under it."
        />
      </div>`,
  }),
}

/** Anything else in the default slot, with the same caption under it. */
export const OtherContent: Story = {
  render: () => ({
    components: { Figure },
    template: `
      <div class="mx-auto max-w-xl">
        <Figure caption="Not a picture at all.">
          <div class="grid h-40 place-items-center rounded-[var(--radius-lg)] bg-surface text-fg-muted">Anything</div>
        </Figure>
      </div>`,
  }),
}

/** The caption in a slot, for a link or a mark inside it. */
export const RichCaption: Story = {
  render: () => ({
    components: { Figure },
    template: `
      <div class="mx-auto max-w-xl">
        <Figure src="https://picsum.photos/id/1036/1600/1000" alt="Winter light">
          <template #caption>Winter light, from <a href="https://picsum.photos" class="text-fg underline underline-offset-4">Picsum</a>.</template>
        </Figure>
      </div>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** A picture with nothing more to show: it does not open. */
export const NotZoomable: Story = {
  render: () => ({
    components: { Figure },
    template: `<div class="mx-auto max-w-xl"><Figure src="https://picsum.photos/id/1080/1600/1000" alt="Market" caption="Not zoomable." :zoomable="false" /></div>`,
  }),
}

/** No caption: just the picture, which still opens. */
export const NoCaption: Story = {
  render: () => ({
    components: { Figure },
    template: `<div class="mx-auto max-w-xl"><Figure src="https://picsum.photos/id/1015/1600/1000" alt="A river valley" /></div>`,
  }),
}
