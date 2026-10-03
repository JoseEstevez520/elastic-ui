import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Mail } from '@lucide/vue'
import { siBluesky, siDribbble, siGithub, siInstagram, siX, siYoutube } from 'simple-icons'
import SocialLink from './SocialLink.vue'
import SocialLinks from './SocialLinks.vue'

// Simple Icons dropped LinkedIn's mark at the company's request: a project passes its own, the
// same shape as a Simple Icons entry.
const LINKEDIN = {
  title: 'LinkedIn',
  hex: '0A66C2',
  path: 'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z',
}
// Instagram's mark is one colour in Simple Icons; the brand is its gradient.
const INSTAGRAM_GRADIENT = 'linear-gradient(45deg, #f9ce34, #ee2a7b 50%, #6228d7)'

const PLACES = [
  { icon: siGithub, handle: 'ada-lovelace', href: 'https://github.com' },
  { icon: LINKEDIN, handle: 'Ada Lovelace', href: 'https://www.linkedin.com' },
  { icon: siInstagram, handle: '@ada.builds', href: 'https://www.instagram.com', brand: INSTAGRAM_GRADIENT },
  { icon: Mail, label: 'Email', handle: 'ada@example.com', copy: 'ada@example.com' },
  { icon: siYoutube, handle: 'Ada builds things', href: 'https://www.youtube.com' },
  { icon: siBluesky, handle: '@ada.bsky.social', href: 'https://bsky.app' },
  { icon: siDribbble, handle: 'ada', href: 'https://dribbble.com' },
  { icon: siX, handle: '@ada', href: 'https://x.com' },
]

interface RowArgs {
  expanded: boolean
  /** How many places the row holds. */
  count: number
  /** Swaps in a handle far longer than usual. */
  longText: boolean
  /** Renders two rows, one after the other. */
  rows: number
}

// `args` stays reactive, so the Controls panel updates the row without remounting it.
const row = (args: RowArgs) => ({
  components: { SocialLinks, SocialLink },
  setup: () => ({
    args,
    places: () => PLACES.slice(0, args.count),
    handle: (place: (typeof PLACES)[number]) =>
      args.longText ? `${place.handle} and everything they have ever made` : place.handle,
  }),
  template: `
    <div class="mx-auto flex max-w-2xl flex-col gap-8 py-10">
      <SocialLinks v-for="n in args.rows" :key="n" label="Find me" :expanded="args.expanded">
        <SocialLink
          v-for="place in places()"
          :key="place.handle"
          :icon="place.icon"
          :label="place.label"
          :handle="handle(place)"
          :href="place.href"
          :copy="place.copy"
          :brand="place.brand"
        />
      </SocialLinks>
    </div>`,
})

const meta = {
  title: 'Content/SocialLinks',
  args: { expanded: false, count: 4, longText: false, rows: 1 },
  argTypes: {
    count: { control: { type: 'range', min: 1, max: PLACES.length, step: 1 } },
    rows: { control: { type: 'range', min: 1, max: 2, step: 1 } },
  },
  render: (args) => row(args),
} satisfies Meta<RowArgs>

export default meta
type Story = StoryObj<typeof meta>

/** Point at one: its tray widens into its handle over its brand. The email copies its address. */
export const Default: Story = {}

/** Every handle at rest, as on a phone, where there is nothing to point with. */
export const Expanded: Story = {
  args: { expanded: true },
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

export const SingleLink: Story = {
  args: { count: 1 },
}

export const ManyLinks: Story = {
  args: { count: PLACES.length },
}

export const ManyLinksExpanded: Story = {
  args: { count: PLACES.length, expanded: true },
}

export const LongText: Story = {
  args: { longText: true, expanded: true },
}

export const TwoRows: Story = {
  args: { rows: 2 },
}

export const Mobile: Story = {
  args: { count: PLACES.length },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
