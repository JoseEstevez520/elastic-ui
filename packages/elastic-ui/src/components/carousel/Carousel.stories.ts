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

const posts = [
  { title: 'Aventura en Lisboa', date: '16 Oct' },
  { title: 'Ocho meses con Maneva', date: '15 Jun' },
  { title: 'Internet está roto', date: '7 Aug' },
  { title: 'Cierre de las becas', date: '20 Sep' },
]

/**
 * Two cards in view, whole, with only the dots to move and a link at the end of the row. It moves
 * one card at a time and stops where the last card meets the end, so there is never a gap; the dots
 * mark the places it can stop, which are fewer than the cards.
 */
export const TwoInView: Story = {
  render: () => ({
    components: { Carousel, CarouselItem },
    setup: () => ({ posts }),
    template: `
      <div class="mx-auto max-w-2xl">
        <Carousel :per-view="2" :arrows="false" label="Posts">
          <CarouselItem v-for="post in posts" :key="post.title">
            <div class="flex h-40 flex-col justify-end rounded-[var(--radius-xl)] bg-surface p-5">
              <p class="text-meta text-fg-muted">{{ post.date }}</p>
              <p class="text-copy text-fg">{{ post.title }}</p>
            </div>
          </CarouselItem>
          <template #end><a href="#" class="text-label text-fg-muted hover:text-fg">All posts</a></template>
        </Carousel>
      </div>`,
  }),
}

/** One card on a phone and two from `sm`, with no script: the property is set with classes. */
export const PerViewByScreen: Story = {
  render: () => ({
    components: { Carousel, CarouselItem },
    setup: () => ({ posts }),
    template: `
      <div class="mx-auto max-w-2xl">
        <Carousel class="[--carousel-per-view:1] sm:[--carousel-per-view:2]" :arrows="false" label="Posts">
          <CarouselItem v-for="post in posts" :key="post.title">
            <div class="flex h-40 flex-col justify-end rounded-[var(--radius-xl)] bg-surface p-5">
              <p class="text-meta text-fg-muted">{{ post.date }}</p>
              <p class="text-copy text-fg">{{ post.title }}</p>
            </div>
          </CarouselItem>
        </Carousel>
      </div>`,
  }),
}

/** Three in view with only three cards: nowhere to move, so no dots, and the link stays. */
export const AllInView: Story = {
  render: () => ({
    components: { Carousel, CarouselItem },
    setup: () => ({ posts: posts.slice(0, 3) }),
    template: `
      <div class="mx-auto max-w-2xl">
        <Carousel :per-view="3" :arrows="false" label="Posts">
          <CarouselItem v-for="post in posts" :key="post.title">
            <div class="flex h-32 items-end rounded-[var(--radius-xl)] bg-surface p-4"><p class="text-ui text-fg">{{ post.title }}</p></div>
          </CarouselItem>
          <template #end><a href="#" class="text-label text-fg-muted hover:text-fg">All posts</a></template>
        </Carousel>
      </div>`,
  }),
}

/** One card and `always-show-dots`: the row is there, ready for the next one. */
export const OneCardWithDots: Story = {
  render: () => ({
    components: { Carousel, CarouselItem },
    setup: () => ({ post: posts[0] }),
    template: `
      <div class="mx-auto max-w-2xl">
        <Carousel :per-view="2" :arrows="false" always-show-dots label="Posts">
          <CarouselItem>
            <div class="flex h-40 flex-col justify-end rounded-[var(--radius-xl)] bg-surface p-5">
              <p class="text-meta text-fg-muted">{{ post.date }}</p>
              <p class="text-copy text-fg">{{ post.title }}</p>
            </div>
          </CarouselItem>
          <template #end><a href="#" class="text-label text-fg-muted hover:text-fg">All posts</a></template>
        </Carousel>
      </div>`,
  }),
}

/**
 * Photos, two in view, each one an ImageView that opens where it is. Only the photos wholly in view
 * can be pressed; dragging the carousel does not open one.
 */
export const PhotosTwoInView: Story = {
  render: () => ({
    components: { Carousel, CarouselItem, ImageView },
    setup: () => ({ photos }),
    template: `
      <div class="mx-auto max-w-2xl">
        <Carousel :per-view="2" :arrows="false" label="Photos of Curio">
          <CarouselItem v-for="p in photos" :key="p.src">
            <ImageView :src="p.src" :alt="p.alt" :caption="p.alt" class="aspect-[4/3] w-full rounded-[var(--radius-lg)] object-cover" />
          </CarouselItem>
        </Carousel>
      </div>`,
  }),
}
