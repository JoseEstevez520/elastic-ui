import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { CardDescription, CardTitle } from '../card'
import ExpandableCard from './ExpandableCard.vue'
import ExpandableCardGroup from './ExpandableCardGroup.vue'
import ExpandableCardIndicator from './ExpandableCardIndicator.vue'
import ExpandableCardMark from './ExpandableCardMark.vue'
import ExpandableCardMorph from './ExpandableCardMorph.vue'

const PROJECTS = [
  {
    name: 'Curio',
    brand: '#2e9bf7',
    period: '2025',
    tagline: 'A learning app that turns your notes into spaced-repetition quizzes.',
    description: 'Upload your notes and Curio generates quizzes from them, scheduling each question for when you are about to forget it.',
    tags: ['Vue', 'Tailwind', 'Node', 'PostgreSQL'],
  },
  {
    name: 'SkillNet',
    brand: '#1c8853',
    period: '2024',
    tagline: 'A network to trade skills with classmates.',
    description: 'Students offer what they know and ask for what they need; the app matches them into study pairs.',
    tags: ['React', 'Express', 'MongoDB'],
  },
  {
    name: 'Maneva',
    brand: '#a48a27',
    period: '2024',
    tagline: 'Booking site for a beauty salon.',
    description: 'Online booking, staff calendars and reminders for a real salon, replacing a paper diary.',
    tags: ['Laravel', 'MySQL', 'Tailwind'],
  },
  {
    name: 'Micafold',
    brand: undefined,
    period: '2023',
    tagline: 'Team project: a shared folder of study materials.',
    description: 'A group project to organise and share class materials by subject.',
    tags: ['PHP', 'MySQL'],
  },
]

const meta = {
  title: 'Special/ExpandableCard',
  component: ExpandableCardGroup,
  parameters: { layout: 'padded' },
  render: () => ({
    components: {
      ExpandableCardGroup,
      ExpandableCard,
      ExpandableCardMorph,
      ExpandableCardIndicator,
      ExpandableCardMark,
      CardTitle,
      CardDescription,
    },
    setup: () => ({ PROJECTS }),
    template: `
      <div class="mx-auto max-w-4xl py-10">
        <ExpandableCardGroup>
          <ExpandableCard
            v-for="project in PROJECTS"
            :key="project.name"
            :value="project.name"
            :brand="project.brand"
          >
            <ExpandableCardMark>
              <span class="grid size-9 place-items-center rounded-full border border-border-strong text-sm font-semibold text-fg-muted">
                {{ project.name[0] }}
              </span>
            </ExpandableCardMark>

            <ExpandableCardMorph name="heading" class="min-w-0">
              <CardTitle class="truncate">{{ project.name }}</CardTitle>
              <CardDescription class="mt-1 truncate">{{ project.tagline }}</CardDescription>
            </ExpandableCardMorph>

            <ExpandableCardMorph name="period" class="ml-auto shrink-0 text-xs text-fg-faint">
              {{ project.period }}
            </ExpandableCardMorph>

            <ExpandableCardIndicator />

            <template #body>
              <p class="text-fg-secondary">{{ project.description }}</p>
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
  }),
} satisfies Meta<typeof ExpandableCardGroup>

export default meta
type Story = StoryObj<typeof meta>

export const ProjectGrid: Story = {}
