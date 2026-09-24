import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { CardTitle } from '../card'
import ExpandableCard from './ExpandableCard.vue'
import ExpandableCardGroup from './ExpandableCardGroup.vue'
import ExpandableCardIndicator from './ExpandableCardIndicator.vue'
import ExpandableCardMark from './ExpandableCardMark.vue'
import ExpandableCardMorph from './ExpandableCardMorph.vue'
import ExpandableCardText from './ExpandableCardText.vue'
import ExpandableCardImage from './ExpandableCardImage.vue'

const PROJECTS = [
  {
    name: 'Curio',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80',
    brand: '#2e9bf7',
    period: '2025',
    tagline: 'A learning app that turns your notes into spaced-repetition quizzes.',
    description: 'Upload your notes and Curio generates quizzes from them, scheduling each question for when you are about to forget it.',
    tags: ['Vue', 'Tailwind', 'Node', 'PostgreSQL'],
  },
  {
    name: 'SkillNet',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80',
    brand: '#1c8853',
    period: '2024',
    tagline: 'A network to trade skills with classmates.',
    description: 'Students offer what they know and ask for what they need; the app matches them into study pairs.',
    tags: ['React', 'Express', 'MongoDB'],
  },
  {
    name: 'Maneva',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80',
    brand: '#a48a27',
    period: '2024',
    tagline: 'Booking site for a beauty salon.',
    description: 'Online booking, staff calendars and reminders for a real salon, replacing a paper diary.',
    tags: ['Laravel', 'MySQL', 'Tailwind'],
  },
  {
    name: 'Micafold',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=80',
    brand: undefined,
    period: '2023',
    tagline: 'Team project: a shared folder of study materials.',
    description: 'A group project to organise and share class materials by subject.',
    tags: ['PHP', 'MySQL'],
  },
]

const LONG_TAGLINE =
  'A tagline far too long for a single line, to check that it fades at the edge instead of wrapping'
const LONG_DESCRIPTION = Array(6)
  .fill('A body much taller than one row of cards, to check that the open card grows past the grid.')
  .join(' ')

interface GridArgs {
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
  },
  setup: () => ({
    args,
    PROJECTS,
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
          :brand="args.brandColors ? project.brand : undefined"
        >
          <template v-if="hasImage(index)" #media>
            <ExpandableCardImage :src="project.image" alt="" fade />
          </template>

          <ExpandableCardMark>
            <span class="grid size-9 place-items-center rounded-full border border-border-strong text-sm font-semibold text-fg-muted">
              {{ project.name[0] }}
            </span>
          </ExpandableCardMark>

          <ExpandableCardMorph name="title" class="min-w-0">
            <CardTitle class="truncate">{{ project.name }}</CardTitle>
          </ExpandableCardMorph>

          <ExpandableCardMorph name="period" class="ml-auto shrink-0 pt-0.5 text-xs text-fg-faint">
            {{ project.period }}
          </ExpandableCardMorph>

          <ExpandableCardIndicator />

          <!-- On a line of its own, so it uses the card's full width. -->
          <ExpandableCardMorph name="tagline" class="min-w-0 basis-full">
            <ExpandableCardText name="tagline" class="text-sm text-fg-muted">
              {{ tagline(project) }}
            </ExpandableCardText>
          </ExpandableCardMorph>

          <template #body>
            <p class="text-fg-secondary">{{ description(project) }}</p>
          <a href="#" class="mt-3 self-start text-sm text-accent hover:text-accent-hover" @click.prevent>
            View project ↗
          </a>
            <ul class="mt-auto flex flex-wrap gap-2 pt-4">
              <li
                v-for="tag in project.tags"
                :key="tag"
                class="rounded-md border border-border px-2.5 py-1 text-xs text-fg-muted"
              >
                {{ tag }}
              </li>
            </ul>
          </template>
        </ExpandableCard>
      </ExpandableCardGroup>
    </div>`,
})

const meta = {
  title: 'Special/ExpandableCard',
  parameters: { layout: 'padded' },
  args: { count: 4, images: 'none', brandColors: false, longText: false, groups: 1 },
  argTypes: {
    count: { control: { type: 'range', min: 1, max: PROJECTS.length, step: 1 } },
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

export const BrandColors: Story = {
  args: { brandColors: true },
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

export const TwoGroups: Story = {
  args: { count: 2, groups: 2 },
}

/** One column: opening the last card has to bring the open card into view. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
