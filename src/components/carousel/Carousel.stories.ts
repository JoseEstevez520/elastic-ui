import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import ImageView from '../image-view/ImageView.vue'
import Carousel from './Carousel.vue'
import CarouselItem from './CarouselItem.vue'

const meta = { title: 'Content/Carousel', component: Carousel, parameters: { layout: 'padded' } } satisfies Meta<
  typeof Carousel
>
export default meta
type Story = StoryObj<typeof meta>

const photos = [
  { src: 'https://picsum.photos/id/1043/1600/1000', alt: 'Old streets' },
  { src: 'https://picsum.photos/id/1036/1600/1000', alt: 'Winter light' },
  { src: 'https://picsum.photos/id/1080/1600/1000', alt: 'Market' },
  { src: 'https://picsum.photos/id/1015/1600/1000', alt: 'A river valley' },
  { src: 'https://picsum.photos/id/1039/1600/1000', alt: 'A waterfall' },
]

/**
 * Photos of a project: drag or swipe, the chevrons, the dots or the arrow keys; the pill stretches
 * to the next dot and parts from the old one. Press a photo to see it whole, where it is.
 */
export const Photos: Story = {
  render: () => ({
    components: { Carousel, CarouselItem, ImageView },
    setup: () => ({ photos, index: ref(0) }),
    template: `
      <div class="mx-auto max-w-2xl">
        <Carousel v-model="index" label="Photos of Curio">
          <CarouselItem v-for="p in photos" :key="p.src">
            <ImageView :src="p.src" :alt="p.alt" class="aspect-[16/10] w-full object-cover" />
          </CarouselItem>
        </Carousel>
      </div>`,
  }),
}

/** Cards of projects, the next one peeking in (a `basis-*` class on each slide); it goes round with `loop`. */
export const Projects: Story = {
  render: () => ({
    components: { Carousel, CarouselItem },
    setup: () => ({
      projects: [
        { name: 'Curio', line: 'A learning app that turns notes into quizzes.' },
        { name: 'SkillNet', line: 'A network to trade skills with classmates.' },
        { name: 'Maneva', line: 'Booking site for a beauty salon.' },
        { name: 'Micafold', line: 'A shared folder of study materials.' },
      ],
    }),
    template: `
      <div class="mx-auto max-w-xl">
        <Carousel loop label="Projects">
          <CarouselItem v-for="p in projects" :key="p.name" class="basis-4/5">
            <div class="flex h-48 flex-col justify-end rounded-[var(--radius-xl)] bg-surface p-6">
              <p class="text-title text-fg">{{ p.name }}</p>
              <p class="mt-1 text-ui text-fg-muted">{{ p.line }}</p>
            </div>
          </CarouselItem>
        </Carousel>
      </div>`,
  }),
}

/** A single slide: no dots or chevrons, nothing to move. */
export const OneSlide: Story = {
  render: () => ({
    components: { Carousel, CarouselItem },
    template: `
      <div class="mx-auto max-w-xl">
        <Carousel label="Photo">
          <CarouselItem><img src="https://picsum.photos/id/1043/1600/1000" alt="Old streets" class="aspect-[16/10] w-full object-cover" /></CarouselItem>
        </Carousel>
      </div>`,
  }),
}
