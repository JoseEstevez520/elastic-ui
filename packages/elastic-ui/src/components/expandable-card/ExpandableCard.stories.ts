import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { BookOpen, FolderOpen, Scissors, Users } from '@lucide/vue'
import { Button } from '../button'
import { CardTitle } from '../card'
import { Glow } from '../glow'
import ExpandableCard from './ExpandableCard.vue'
import ExpandableCardGroup from './ExpandableCardGroup.vue'
import ExpandableCardIndicator from './ExpandableCardIndicator.vue'
import ExpandableCardMark from './ExpandableCardMark.vue'
import ExpandableCardMorph from './ExpandableCardMorph.vue'
import ExpandableCardText from './ExpandableCardText.vue'
import ExpandableCardImage from './ExpandableCardImage.vue'

const ICONS = [BookOpen, Users, Scissors, FolderOpen]

const PROJECTS = [
  {
    name: 'Northwind',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80',
    brand: '#2e9bf7',
    glow: ['#2e9bf7', '#7cc4ff', '#1d4ed8'],
    period: '2025',
    tagline: 'A dashboard that tracks orders and stock for a small shop.',
    description:
      'Orders come in from a form, stock updates with each one, and a daily figure shows what sold and what is running low.',
    tags: ['Vue', 'Tailwind', 'Node', 'PostgreSQL'],
  },
  {
    name: 'Beacon',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80',
    brand: '#1c8853',
    glow: ['#1c8853', '#6fd3a0', '#0f5f3a'],
    period: '2024',
    tagline: 'A tool that watches a page and pings you when it changes.',
    description: 'You point it at an address and a rule; it checks on a schedule and sends a message when something matches.',
    tags: ['React', 'Express', 'MongoDB'],
  },
  {
    name: 'Harbor',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80',
    brand: '#a48a27',
    glow: ['#d4af37', '#f2d98a', '#8a6d12'],
    period: '2024',
    tagline: 'A booking site for a small studio.',
    description: 'Visitors pick a time from a live calendar and get a reminder; the studio sees the day at a glance.',
    tags: ['Laravel', 'MySQL', 'Tailwind'],
  },
  {
    name: 'Mosaic',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=80',
    brand: undefined,
    glow: ['#9b9a97', '#c9c8c4'],
    period: '2023',
    tagline: 'A shared folder of notes, organised by subject.',
    description: 'A small group project to keep class materials in one place, sorted by subject and week.',
    tags: ['PHP', 'MySQL'],
  },
]

const LONG_TAGLINE = 'A tagline far too long for a single line, to check that it fades at the edge instead of wrapping'
const LONG_DESCRIPTION = Array(6)
  .fill('A body much taller than one row of cards, to check that the open card grows past the grid.')
  .join(' ')

interface GridArgs {
  variant: 'default' | 'ghost'
  /** How many projects each group shows. */
  count: number
  /** `mixed` puts an image on every other card. */
  images: 'none' | 'all' | 'mixed'
  /** Tints each card's edge with its project's color on hover and while open. */
  brandColors: boolean
  /** Swaps in a tagline and body far longer than the space they get. */
  longText: boolean
  /** Renders two independent groups, one after the other. */
  groups: number
  /** A Glow in each project's colours behind its open card. */
  glow: boolean
}

// `args` stays reactive, so the Controls panel updates the grid without remounting it.
const projectGrid = (args: GridArgs) => ({
  components: {
    ExpandableCardGroup,
    ExpandableCard,
    ExpandableCardMorph,
    ExpandableCardIndicator,
    ExpandableCardMark,
    ExpandableCardText,
    ExpandableCardImage,
    CardTitle,
    Glow,
  },
  setup: () => ({
    args,
    PROJECTS,
    ICONS,
    hasImage: (index: number) => args.images === 'all' || (args.images === 'mixed' && index % 2 === 0),
    tagline: (project: (typeof PROJECTS)[number]) => (args.longText ? LONG_TAGLINE : project.tagline),
    description: (project: (typeof PROJECTS)[number]) => (args.longText ? LONG_DESCRIPTION : project.description),
  }),
  template: `
    <div class="mx-auto flex max-w-4xl flex-col gap-10 py-10">
      <ExpandableCardGroup v-for="group in args.groups" :key="group">
        <ExpandableCard
          v-for="(project, index) in PROJECTS.slice(0, args.count)"
          :key="project.name"
          :value="project.name + '-' + group"
          :variant="args.variant"
          :brand="args.brandColors ? project.brand : undefined"
        >
          <template v-if="args.glow" #backdrop>
            <Glow :colors="project.glow" />
          </template>

          <template v-if="hasImage(index)" #media>
            <ExpandableCardImage :src="project.image" alt="" fade />
          </template>

          <ExpandableCardMark>
            <!-- An icon on a tile a tone off the open card, as tall as the title's line so the two sit level. -->
            <span class="-my-px grid size-7 place-items-center rounded-[var(--radius-md)] bg-surface text-fg-muted">
              <component :is="ICONS[index % ICONS.length]" class="size-4" aria-hidden="true" />
            </span>
          </ExpandableCardMark>

          <ExpandableCardMorph name="title" class="min-w-0">
            <CardTitle class="truncate">{{ project.name }}</CardTitle>
          </ExpandableCardMorph>

          <ExpandableCardMorph name="period" class="ml-auto shrink-0 pt-0.5 text-meta tabular-nums text-fg-faint">
            {{ project.period }}
          </ExpandableCardMorph>

          <ExpandableCardIndicator />

          <!-- On a line of its own, so it uses the card's full width. -->
          <ExpandableCardMorph name="tagline" class="min-w-0 basis-full">
            <ExpandableCardText name="tagline" class="text-ui text-fg-muted">
              {{ tagline(project) }}
            </ExpandableCardText>
          </ExpandableCardMorph>

          <template #body>
            <p class="text-fg-secondary">{{ description(project) }}</p>
            <p class="mt-auto pt-4 text-sm text-fg-muted">{{ project.tags.join(' · ') }}</p>
          </template>
        </ExpandableCard>
      </ExpandableCardGroup>
    </div>`,
})

const meta = {
  title: 'Disclosure/ExpandableCard',
  args: { variant: 'default', count: 4, images: 'none', brandColors: false, longText: false, groups: 1, glow: false },
  argTypes: {
    count: { control: { type: 'range', min: 1, max: PROJECTS.length, step: 1 } },
    variant: { control: 'inline-radio', options: ['default', 'ghost'] },
    images: { control: 'inline-radio', options: ['none', 'all', 'mixed'] },
    groups: { control: { type: 'range', min: 1, max: 2, step: 1 } },
  },
  render: (args) => projectGrid(args),
} satisfies Meta<GridArgs>

export default meta
type Story = StoryObj<typeof meta>

export const ProjectGrid: Story = {}

export const WithImages: Story = {
  args: { images: 'all' },
}

/** Only the content at rest; the box appears on hover, keyboard focus and when open. */
export const Ghost: Story = {
  args: { variant: 'ghost', images: 'all' },
}

export const BrandColors: Story = {
  args: { brandColors: true },
}

/**
 * Opened, each card glows in its project's colours (Glow, given its colours or its logo as `src`),
 * washing in as the card lands; closed, the four stay quiet and alike.
 */
export const GlowWhenOpen: Story = {
  args: { brandColors: true, glow: true },
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

export const TwoCards: Story = {
  args: { count: 2 },
}

export const TwoCardsWithImages: Story = {
  args: { count: 2, images: 'all' },
}

export const OddCount: Story = {
  args: { count: 3 },
}

export const SingleCard: Story = {
  args: { count: 1 },
}

export const MixedImages: Story = {
  args: { images: 'mixed' },
}

export const LongText: Story = {
  args: { count: 2, longText: true },
}

/**
 * A body that changes while the card is open: the details come and go, and the card takes its new
 * height without its text being stretched, and shrinks back as they go.
 */
export const ChangingContent: Story = {
  render: () => ({
    components: { ExpandableCardGroup, ExpandableCard, ExpandableCardMorph, CardTitle, Button },
    setup: () => ({ PROJECTS: PROJECTS.slice(0, 2), details: ref(false) }),
    template: `
      <div class="mx-auto max-w-4xl py-10">
        <ExpandableCardGroup>
          <ExpandableCard v-for="project in PROJECTS" :key="project.name">
            <ExpandableCardMorph name="title" class="min-w-0">
              <CardTitle>{{ project.name }}</CardTitle>
            </ExpandableCardMorph>
            <template #body>
              <p class="text-fg-secondary">{{ project.description }}</p>
              <div class="pt-4">
                <Button variant="ghost" size="sm" @click="details = !details">{{ details ? 'Hide the details' : 'Show the details' }}</Button>
              </div>
              <ul v-if="details" class="flex flex-col gap-2 pt-2 text-fg-secondary">
                <li v-for="tag in project.tags" :key="tag">{{ tag }}: where it was used, and why it was picked over the rest.</li>
              </ul>
            </template>
          </ExpandableCard>
        </ExpandableCardGroup>
      </div>`,
  }),
}

export const TwoGroups: Story = {
  args: { count: 2, groups: 2 },
}

/** One column: opening the last card has to bring the open card into view. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
