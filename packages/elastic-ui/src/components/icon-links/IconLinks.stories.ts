import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Globe, Mail } from '@lucide/vue'
import { siBluesky, siDribbble, siGithub, siInstagram, siX, siYoutube } from 'simple-icons'
import { Glow } from '../glow'
import IconLink from './IconLink.vue'
import IconLinks from './IconLinks.vue'

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
  { icon: siGithub, label: 'ada-lovelace', href: 'https://github.com' },
  { icon: LINKEDIN, label: 'Ada Lovelace', href: 'https://www.linkedin.com' },
  { icon: siInstagram, label: '@ada.builds', href: 'https://www.instagram.com', brand: INSTAGRAM_GRADIENT },
  { icon: Mail, name: 'Email', label: 'ada@example.com', copy: 'ada@example.com' },
  { icon: siYoutube, label: 'Ada builds things', href: 'https://www.youtube.com' },
  { icon: siBluesky, label: '@ada.bsky.social', href: 'https://bsky.app' },
  { icon: siDribbble, label: 'ada', href: 'https://dribbble.com' },
  { icon: siX, label: '@ada', href: 'https://x.com' },
]

interface RowArgs {
  variant: 'default' | 'ghost'
  expanded: boolean
  /** How many links the row holds. */
  count: number
  /** Swaps in a label far longer than usual. */
  longText: boolean
  /** Renders two rows, one after the other. */
  rows: number
}

// `args` stays reactive, so the Controls panel updates the row without remounting it.
const row = (args: RowArgs) => ({
  components: { IconLinks, IconLink },
  setup: () => ({
    args,
    places: () => PLACES.slice(0, args.count),
    label: (place: (typeof PLACES)[number]) =>
      args.longText ? `${place.label} and everything they have ever made` : place.label,
  }),
  template: `
    <div class="mx-auto flex max-w-2xl flex-col gap-8 py-10">
      <IconLinks v-for="n in args.rows" :key="n" label="Find me" :variant="args.variant" :expanded="args.expanded">
        <IconLink
          v-for="place in places()"
          :key="place.label"
          :icon="place.icon"
          :name="place.name"
          :label="label(place)"
          :href="place.href"
          :copy="place.copy"
          :brand="place.brand"
        />
      </IconLinks>
    </div>`,
})

const meta = {
  title: 'Navigation/IconLinks',
  args: { variant: 'default', expanded: false, count: 4, longText: false, rows: 1 },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'ghost'] },
    count: { control: { type: 'range', min: 1, max: PLACES.length, step: 1 } },
    rows: { control: { type: 'range', min: 1, max: 2, step: 1 } },
  },
  render: (args) => row(args),
} satisfies Meta<RowArgs>

export default meta
type Story = StoryObj<typeof meta>

/** Point at one: its tray widens into its label over its brand. The email copies its address. */
export const Default: Story = {}

/** Every label at rest, as on a phone, where there is nothing to point with. */
export const Expanded: Story = {
  args: { expanded: true },
}

/** What a project offers, its site and its code: plain icons, in the text's grey. */
export const ProjectLinks: Story = {
  render: () => ({
    components: { IconLinks, IconLink },
    setup: () => ({ Globe, siGithub }),
    template: `
      <div class="mx-auto max-w-2xl py-10">
        <IconLinks label="Project" variant="ghost">
          <IconLink :icon="Globe" label="Site" href="https://example.com" />
          <IconLink :icon="siGithub" label="Code" href="https://github.com" />
        </IconLinks>
      </div>`,
  }),
}

/** No tray at rest, so nothing covers the colour behind; the tint comes as one opens. */
export const GhostOverColour: Story = {
  render: () => ({
    components: { IconLinks, IconLink, Glow },
    setup: () => ({ Globe, siGithub, LINKEDIN }),
    template: `
      <div class="relative mx-auto max-w-2xl overflow-hidden rounded-[var(--radius-xl)] p-8">
        <Glow :colors="['#1c8853', '#6fd3a0', '#0f5f3a']" />
        <IconLinks label="Project" variant="ghost" class="relative">
          <IconLink :icon="Globe" label="Site" href="https://example.com" />
          <IconLink :icon="siGithub" label="Code" href="https://github.com" />
          <IconLink :icon="LINKEDIN" label="Ada Lovelace" href="https://www.linkedin.com" />
        </IconLinks>
      </div>`,
  }),
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
