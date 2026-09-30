import type { Meta, StoryObj } from '@storybook/vue3-vite'
import PageCard from './PageCard.vue'

const body = [
  'The brief was a small site that had to work offline, for people walking where there is no signal. Everything it needs is kept on the phone the first time it opens.',
  'The map is drawn from vector tiles, so it stays sharp at every zoom and weighs a fraction of the images it replaced. Routes are stored as lines and read out as you go.',
  'What I would do again: test on the cheapest phone first. What I would not: build the route editor before anyone asked for it.',
  'Built with Vue, a service worker and IndexedDB. Deployed on a static host, with no server to keep alive.',
]
const projects = [
  {
    image: 'https://picsum.photos/id/1015/1200/800',
    title: 'River valley',
    kind: 'Web app',
    summary: 'Trail maps that work with no signal.',
    slug: 'river-valley',
  },
  {
    image: 'https://picsum.photos/id/1080/1200/800',
    title: 'Market',
    kind: 'Shop',
    summary: 'A greengrocer’s orders, from a phone.',
    slug: 'market',
  },
  {
    image: 'https://picsum.photos/id/1036/1200/800',
    title: 'Winter light',
    kind: 'Photography',
    summary: 'A season in the mountains, as a story.',
    slug: 'winter-light',
  },
  {
    image: 'https://picsum.photos/id/1043/1200/800',
    title: 'Old town',
    kind: 'Guide',
    summary: 'A walk through a city’s oldest streets.',
    slug: 'old-town',
  },
]

const meta = {
  title: 'Content/PageCard',
  component: PageCard,
  parameters: { layout: 'fullscreen' },
  args: { image: projects[0]!.image, title: projects[0]!.title },
} satisfies Meta<typeof PageCard>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Press a card: it becomes its page, its image the header, its glow the page's ground. Back, Escape
 * or the browser's back fold it into the card again. The address is the page's while it is open.
 */
export const Projects: Story = {
  render: () => ({
    components: { PageCard },
    setup: () => ({ projects, body }),
    template: `
      <div class="mx-auto max-w-4xl px-6 py-12">
        <h2 class="mb-8 text-2xl font-semibold tracking-tight text-fg">Projects</h2>
        <div class="grid gap-6 sm:grid-cols-2">
          <PageCard v-for="p in projects" :key="p.slug" :image="p.image" :title="p.title" :href="'#/projects/' + p.slug">
            <p class="text-xs font-medium text-fg-muted">{{ p.kind }}</p>
            <h3 class="mt-1 text-lg font-semibold text-fg">{{ p.title }}</h3>
            <p class="mt-2 text-sm text-fg-secondary">{{ p.summary }}</p>
            <template #page>
              <p class="text-sm font-medium text-fg-muted">{{ p.kind }}</p>
              <h1 class="mt-1 text-4xl font-semibold tracking-tight text-fg">{{ p.title }}</h1>
              <p class="mt-4 text-lg text-fg-secondary">{{ p.summary }}</p>
              <p v-for="(para, n) in body" :key="n" class="mt-5 leading-relaxed text-fg-secondary">{{ para }}</p>
            </template>
          </PageCard>
        </div>
      </div>`,
  }),
}
