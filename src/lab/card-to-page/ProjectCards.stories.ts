import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ProjectCards, { type Project } from './ProjectCards.vue'

const body = [
  'The brief was a small site that had to work offline, for people walking where there is no signal. Everything it needs is kept on the phone the first time it opens.',
  'The map is drawn from vector tiles, so it stays sharp at every zoom and weighs a fraction of the images it replaced. Routes are stored as lines and read out as you go.',
  'What I would do again: test on the cheapest phone first. What I would not: build the route editor before anyone asked for it.',
  'Built with Vue, a service worker and IndexedDB. Deployed on a static host, with no server to keep alive.',
]

const projects: Project[] = [
  { src: 'https://picsum.photos/id/1015/1200/800', title: 'River valley', kind: 'Web app', summary: 'Trail maps that work with no signal.', body },
  { src: 'https://picsum.photos/id/1080/1200/800', title: 'Market', kind: 'Shop', summary: 'A greengrocer’s orders, from a phone.', body },
  { src: 'https://picsum.photos/id/1036/1200/800', title: 'Winter light', kind: 'Photography', summary: 'A season in the mountains, as a story.', body },
  { src: 'https://picsum.photos/id/1043/1200/800', title: 'Old town', kind: 'Guide', summary: 'A walk through a city’s oldest streets.', body },
]

const meta = {
  title: 'Lab/Card to page',
  component: ProjectCards,
  parameters: { layout: 'fullscreen' },
  args: { projects },
  render: (args) => ({
    components: { ProjectCards },
    setup: () => ({ args }),
    template: `
      <div class="mx-auto max-w-4xl px-6 py-12">
        <h2 class="mb-8 text-2xl font-semibold tracking-tight text-fg">Projects</h2>
        <ProjectCards v-bind="args" />
      </div>`,
  }),
} satisfies Meta<typeof ProjectCards>

export default meta
type Story = StoryObj<typeof meta>

/** Press a card: it becomes its page, its photo the header, its glow the page's ground. Back, or Escape. */
export const Default: Story = {}
