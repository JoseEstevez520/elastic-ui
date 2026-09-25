import { BookOpen, CircleDot, Code, Tag } from '@lucide/vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import AnimatedList from '../animated-list/AnimatedList.vue'
import Card from '../card/Card.vue'
import CardDescription from '../card/CardDescription.vue'
import CardTitle from '../card/CardTitle.vue'
import Filters from './Filters.vue'
import type { FilterCategory, FilterValue } from './filters.variants'

// A course's tasks, to filter by module, state and technology.
interface Task {
  id: number
  title: string
  module: string
  state: string
  tech: string[]
}
const TASKS: Task[] = [
  { id: 1, title: 'Form validation with the Constraint API', module: 'dwcc', state: 'due', tech: ['javascript', 'html'] },
  { id: 2, title: 'A REST API with Spring Boot', module: 'dwcs', state: 'due', tech: ['java', 'spring'] },
  { id: 3, title: 'Components and props in Vue', module: 'diw', state: 'done', tech: ['vue', 'javascript'] },
  { id: 4, title: 'Deploy on Apache with virtual hosts', module: 'despregamento', state: 'done', tech: ['apache', 'linux'] },
  { id: 5, title: 'DOM events and delegation', module: 'dwcc', state: 'done', tech: ['javascript'] },
  { id: 6, title: 'JPA relations and queries', module: 'dwcs', state: 'due', tech: ['java', 'spring', 'sql'] },
  { id: 7, title: 'A design system with Tailwind', module: 'diw', state: 'due', tech: ['css', 'tailwind'] },
  { id: 8, title: 'Git branches and pull requests', module: 'despregamento', state: 'due', tech: ['git'] },
  { id: 9, title: 'Thymeleaf layouts', module: 'dwcs', state: 'done', tech: ['java', 'spring', 'html'] },
]

const MODULES: Record<string, string> = {
  dwcc: 'Client side',
  dwcs: 'Server side',
  diw: 'Interface design',
  despregamento: 'Deployment',
}
const TECH = ['javascript', 'html', 'css', 'tailwind', 'vue', 'java', 'spring', 'sql', 'apache', 'linux', 'git']
const title = (word: string) => word[0]!.toUpperCase() + word.slice(1)

const MODULE: FilterCategory = {
  key: 'module',
  label: 'Module',
  icon: BookOpen,
  options: Object.entries(MODULES).map(([value, label]) => ({ value, label, count: TASKS.filter((t) => t.module === value).length })),
}
const STATE: FilterCategory = {
  key: 'state',
  label: 'State',
  icon: CircleDot,
  options: [
    { value: 'due', label: 'Due', count: TASKS.filter((t) => t.state === 'due').length },
    { value: 'done', label: 'Handed in', count: TASKS.filter((t) => t.state === 'done').length },
  ],
}
const TECHNOLOGY: FilterCategory = {
  key: 'tech',
  label: 'Technology',
  icon: Code,
  options: TECH.map((value) => ({ value, label: title(value), count: TASKS.filter((t) => t.tech.includes(value)).length })),
}
const CATEGORIES = [MODULE, STATE, TECHNOLOGY]

/** Whether a task passes what is chosen: any of a category's values, and every category. */
const passes = (task: Task, chosen: FilterValue) =>
  (!chosen.module || chosen.module.includes(task.module)) &&
  (!chosen.state || chosen.state.includes(task.state)) &&
  (!chosen.tech || chosen.tech.some((tech) => task.tech.includes(tech)))

/** Filters over the task list, as an app would put them. */
const tasks = ({
  categories = CATEGORIES,
  start = {} as FilterValue,
  count = true,
  width = 'w-[40rem]',
} = {}) => ({
  components: { AnimatedList, Filters },
  setup() {
    const chosen = ref<FilterValue>(start)
    const shown = computed(() => TASKS.filter((t) => passes(t, chosen.value)))
    return { categories, chosen, shown, modules: MODULES, count }
  },
  template: `
    <div class="flex max-w-full flex-col gap-6 ${width}">
      <Filters v-model="chosen" :categories="categories" :count="count ? shown.length : undefined" />
      <AnimatedList
        :items="shown"
        :item-key="(t) => t.id"
        collapse="vertical"
        class="flex flex-col"
        item-class="pb-2 last:pb-0"
      >
        <template #default="{ item }">
          <div class="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3 text-sm">
            <span class="text-fg">{{ item.title }}</span>
            <span class="shrink-0 text-fg-muted">{{ modules[item.module] }}</span>
          </div>
        </template>
        <template #empty>
          <p class="py-8 text-center text-sm text-fg-muted">No tasks match these filters.</p>
        </template>
      </AnimatedList>
    </div>`,
})

const meta = {
  title: 'Special/Filters',
  component: Filters,
  args: { categories: CATEGORIES },
  render: () => tasks(),
} satisfies Meta<typeof Filters>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Filter opens into its categories; a category turns the panel to its options. What is chosen
 * stands beside it as a pill: press it to change it, its cross to take it away.
 */
export const Default: Story = {}

/** Filters already set when the page loads, as from a link: the pills just show. */
export const Preset: Story = {
  render: () => tasks({ start: { module: ['dwcs'], state: ['due'] } }),
}

/** A single category: the panel is its options, with no list of categories to go through. */
export const OneCategory: Story = {
  render: () => tasks({ categories: [STATE] }),
}

/** Cards in a grid, filtered by kind, as a page of resources would be. */
export const Cards: Story = {
  render: () => ({
    components: { AnimatedList, Card, CardDescription, CardTitle, Filters },
    setup() {
      const KINDS = { field: 'Fields', example: 'Examples', tool: 'Tools' }
      const cards = [
        { id: 1, kind: 'field', title: 'Accessibility', text: 'Designing for everyone who uses the page.' },
        { id: 2, kind: 'example', title: 'Linear', text: 'Filters as pills, a panel per category.' },
        { id: 3, kind: 'tool', title: 'Figma', text: 'Design and prototype together.' },
        { id: 4, kind: 'example', title: 'Vercel', text: 'A dashboard that stays quiet.' },
        { id: 5, kind: 'field', title: 'Typography', text: 'Order from type before boxes.' },
        { id: 6, kind: 'tool', title: 'Storybook', text: 'Every component, one at a time.' },
      ]
      const categories: FilterCategory[] = [
        {
          key: 'kind',
          label: 'Kind',
          icon: Tag,
          options: Object.entries(KINDS).map(([value, label]) => ({ value, label, count: cards.filter((c) => c.kind === value).length })),
        },
      ]
      const chosen = ref<FilterValue>({})
      const shown = computed(() => cards.filter((c) => !chosen.value.kind || chosen.value.kind.includes(c.kind)))
      return { categories, chosen, shown }
    },
    template: `
      <div class="flex w-[40rem] max-w-full flex-col gap-6">
        <Filters v-model="chosen" :categories="categories" :count="shown.length" />
        <AnimatedList :items="shown" :item-key="(c) => c.id" as="div" collapse="vertical" class="grid gap-4 sm:grid-cols-2">
          <template #default="{ item }">
            <Card size="sm" class="h-full gap-1 px-4">
              <CardTitle as="h4" size="sm">{{ item.title }}</CardTitle>
              <CardDescription>{{ item.text }}</CardDescription>
            </Card>
          </template>
        </AnimatedList>
      </div>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** Many options: a search field at the top, ready to type, and the list scrolls inside the panel. */
export const ManyOptions: Story = {
  render: () => ({
    components: { Filters },
    setup() {
      const words = 'alpha bravo charlie delta echo foxtrot golf hotel india juliett kilo lima mike november oscar papa quebec romeo sierra tango uniform victor whiskey xray yankee zulu'.split(' ')
      const categories: FilterCategory[] = [
        { key: 'tag', label: 'Tag', icon: Tag, options: words.map((w) => ({ value: w, label: title(w) })) },
        STATE,
      ]
      return { categories, chosen: ref<FilterValue>({}) }
    },
    template: `<Filters v-model="chosen" :categories="categories" class="w-[40rem] max-w-full" />`,
  }),
}

/** Long names, several chosen: the pill keeps two and says how many more. */
export const LongValues: Story = {
  render: () =>
    tasks({
      categories: [
        {
          ...MODULE,
          options: MODULE.options.map((o) => ({ ...o, label: `${o.label} development for the web, second year` })),
        },
        STATE,
        TECHNOLOGY,
      ],
      start: { module: ['dwcc', 'dwcs'], tech: ['java', 'spring', 'sql', 'html'] },
    }),
}

/** A narrow row, as on a phone: pills go onto more lines, the count and Clear with them. */
export const Narrow: Story = {
  render: () => tasks({ width: 'w-[20rem]', start: { module: ['dwcc', 'dwcs'], state: ['due'] } }),
}

/** No count given: only Clear stands beside the pills. */
export const WithoutCount: Story = {
  render: () => tasks({ count: false, start: { state: ['done'] } }),
}

/** Nothing left: the count says so, and the list shows its empty state. */
export const NoResults: Story = {
  render: () => tasks({ start: { module: ['diw'], tech: ['sql'] } }),
}

/** Two on a page, each with its own panel and pills. */
export const TwoOnAPage: Story = {
  render: () => ({
    components: { Filters },
    setup: () => ({ first: ref<FilterValue>({ state: ['due'] }), second: ref<FilterValue>({}), categories: CATEGORIES }),
    template: `
      <div class="flex w-[40rem] max-w-full flex-col gap-8">
        <Filters v-model="first" :categories="categories" :count="3" />
        <Filters v-model="second" :categories="categories" :count="9" />
      </div>`,
  }),
}
