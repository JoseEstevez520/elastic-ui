import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Glow from './Glow.vue'

const covers = [
  { src: 'https://picsum.photos/id/1015/600/600', title: 'River valley', by: 'Field recordings' },
  { src: 'https://picsum.photos/id/1080/600/600', title: 'Market', by: 'Street sounds' },
  { src: 'https://picsum.photos/id/1036/600/600', title: 'Winter light', by: 'Ambient' },
]

const meta = { title: 'Content/Glow', component: Glow, args: { src: covers[0]!.src } } satisfies Meta<typeof Glow>
export default meta
type Story = StoryObj<typeof meta>

/** Behind what shows the image: a player whose ground takes each track's colours, fading from one to the next. */
export const Player: Story = {
  render: () => ({
    components: { Glow },
    setup: () => {
      const i = ref(0)
      return { covers, i, next: () => (i.value = (i.value + 1) % covers.length) }
    },
    template: `
      <div class="relative isolate w-80 overflow-hidden rounded-[2rem] p-6">
        <Glow :src="covers[i].src" class="-z-10" />
        <img :src="covers[i].src" alt="" class="aspect-square w-full rounded-2xl object-cover" />
        <p class="mt-5 text-center font-semibold text-fg">{{ covers[i].title }}</p>
        <p class="text-center text-sm text-fg-muted">{{ covers[i].by }}</p>
        <div class="mt-4 flex justify-center">
          <button class="h-9 cursor-pointer rounded-full bg-[color:var(--color-fg)] px-4 text-sm font-medium text-[color:var(--color-bg)] focus-ring" @click="next">Next</button>
        </div>
      </div>`,
  }),
}

/** Soft, for text on it; vivid, for colour alone. */
export const Tones: Story = {
  render: () => ({
    components: { Glow },
    setup: () => ({ src: covers[1]!.src }),
    template: `
      <div class="flex gap-6">
        <div v-for="tone in ['soft', 'vivid']" :key="tone" class="relative isolate grid h-48 w-64 place-items-center overflow-hidden rounded-3xl">
          <Glow :src="src" :tone="tone" class="-z-10" />
          <span class="text-sm font-medium text-fg">{{ tone }}</span>
        </div>
      </div>`,
  }),
}
