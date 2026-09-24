import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Tabs from './Tabs.vue'
import TabsContent from './TabsContent.vue'
import TabsList from './TabsList.vue'
import TabsTrigger from './TabsTrigger.vue'
import type { TabsVariant } from './tabs.variants'

const CATEGORIES = [
  { value: 'all', label: 'All', projects: ['Curio', 'SkillNet', 'Maneva', 'Micafold'] },
  { value: 'web', label: 'Web', projects: ['Maneva', 'Micafold'] },
  { value: 'mobile', label: 'Mobile', projects: ['SkillNet'] },
  { value: 'ai', label: 'AI', projects: ['Curio'] },
  { value: 'games', label: 'Games', projects: [] },
  { value: 'tools', label: 'Tools', projects: [] },
  { value: 'experiments', label: 'Experiments', projects: [] },
]

interface TabsArgs {
  variant: TabsVariant
  /** How many tabs to show. */
  tabs: number
  /** Swaps in labels far longer than usual. */
  longLabels: boolean
  /** Disables the last tab. */
  disabledTab: boolean
}

// `args` stays reactive, so the Controls panel updates the tabs without remounting them.
const projectFilter = (args: TabsArgs) => ({
  components: { Tabs, TabsList, TabsTrigger, TabsContent },
  setup: () => ({
    args,
    categories: () => CATEGORIES.slice(0, args.tabs),
    label: (text: string) => (args.longLabels ? `${text} projects and experiments` : text),
  }),
  template: `
    <Tabs default-value="all" :variant="args.variant" class="w-[min(32rem,100%)]">
      <TabsList>
        <TabsTrigger
          v-for="(category, index) in categories()"
          :key="category.value"
          :value="category.value"
          :disabled="args.disabledTab && index === categories().length - 1"
        >
          {{ label(category.label) }}
        </TabsTrigger>
      </TabsList>
      <TabsContent v-for="category in categories()" :key="category.value" :value="category.value">
        <ul v-if="category.projects.length" class="flex flex-col">
          <li v-for="project in category.projects" :key="project" class="py-2 text-fg-secondary">
            {{ project }}
          </li>
        </ul>
        <p v-else class="text-sm text-fg-muted">Nothing here yet.</p>
      </TabsContent>
    </Tabs>`,
})

const meta = {
  title: 'Base/Tabs',
  // Top-aligned: centering would re-center the tabs every time the content below changes height.
  parameters: { layout: 'padded' },
  args: { variant: 'underline', tabs: 4, longLabels: false, disabledTab: false },
  argTypes: {
    variant: { control: 'inline-radio', options: ['pill', 'underline'] },
    tabs: { control: { type: 'range', min: 2, max: CATEGORIES.length, step: 1 } },
  },
  render: (args) => projectFilter(args),
} satisfies Meta<TabsArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Underline: Story = {}

export const Pill: Story = {
  args: { variant: 'pill' },
}

/** A package manager switcher, as in documentation. */
export const CodeSwitcher: Story = {
  render: () => ({
    components: { Tabs, TabsList, TabsTrigger, TabsContent },
    setup: () => ({ managers: { npm: 'npm install elastic-ui', pnpm: 'pnpm add elastic-ui', yarn: 'yarn add elastic-ui' } }),
    template: `
      <Tabs default-value="npm" variant="underline" class="w-[min(28rem,100%)]">
        <TabsList>
          <TabsTrigger v-for="(_, name) in managers" :key="name" :value="name">{{ name }}</TabsTrigger>
        </TabsList>
        <TabsContent v-for="(command, name) in managers" :key="name" :value="name">
          <pre class="rounded-lg bg-bg-muted px-4 py-3 font-mono text-sm text-fg">{{ command }}</pre>
        </TabsContent>
      </Tabs>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

export const TwoTabs: Story = {
  args: { tabs: 2 },
}

/** More tabs than fit: the list scrolls sideways instead of overflowing. */
export const ManyTabs: Story = {
  args: { tabs: CATEGORIES.length },
}

export const LongLabels: Story = {
  args: { longLabels: true },
}

export const DisabledTab: Story = {
  args: { disabledTab: true },
}

export const TwoInstances: Story = {
  render: (args) => ({
    components: { Wrapper: projectFilter(args) },
    template: `<div class="flex flex-col gap-10"><Wrapper /><Wrapper /></div>`,
  }),
}
