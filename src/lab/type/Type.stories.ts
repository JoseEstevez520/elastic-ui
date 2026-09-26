import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Bell as BellIcon, Plus as PlusIcon } from '@lucide/vue'
import Button from '../../components/button/Button.vue'
import Switch from '../../components/switch/Switch.vue'
import './type.css'

/**
 * Lab: the same screen set in type as the library sets it today ("Now") and on a scale with rules
 * ("Rules", see type.css). Compare where the eye lands first, and how many kinds of text it meets.
 */
const meta = { title: 'Lab/Type', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const notes = [
  {
    title: 'Subnetting by hand',
    excerpt: 'Split a /24 into four networks and name each range.',
    date: '12 Sep',
    count: 4,
  },
  {
    title: 'DNS, from name to address',
    excerpt: 'What happens between typing a name and the page.',
    date: '18 Sep',
    count: 11,
  },
  { title: 'Routing tables', excerpt: 'Read one line by line, then write your own.', date: '23 Sep', count: 7 },
]

/** As components and stories set type today: a size for each case, uppercase section labels, weight for importance. */
export const Now: Story = {
  render: () => ({
    components: { Button, Switch, BellIcon, PlusIcon },
    setup: () => ({ notes }),
    template: `
      <div class="mx-auto grid max-w-4xl gap-8 md:grid-cols-[1fr_16rem] md:items-start">
        <main>
          <p class="text-[13px] font-medium text-fg-muted">Web server · Unit 3</p>
          <h1 class="mt-1 text-2xl font-bold text-fg">Networks</h1>
          <p class="mt-2 text-[15px] text-fg-secondary">Everything we saw about how machines find and talk to each other.</p>
          <div class="mt-5 flex gap-2">
            <Button><PlusIcon class="size-4" />New note</Button>
            <Button variant="outline">Share</Button>
          </div>
          <h2 class="mt-10 text-xs font-semibold tracking-widest text-fg-muted uppercase">This week</h2>
          <ul class="mt-3 divide-y divide-border">
            <li v-for="n in notes" :key="n.title" class="flex items-baseline gap-4 py-3">
              <div class="min-w-0 flex-1">
                <p class="text-base font-semibold text-fg">{{ n.title }}</p>
                <p class="text-sm text-fg-muted">{{ n.excerpt }}</p>
              </div>
              <span class="rounded-full bg-bg-muted px-2 text-[11px] font-semibold text-fg-secondary">{{ n.count }}</span>
              <span class="text-xs font-medium text-fg-faint">{{ n.date }}</span>
            </li>
          </ul>
        </main>
        <aside class="rounded-[var(--radius-xl)] bg-surface p-5">
          <h3 class="flex items-center gap-2 text-lg font-semibold text-fg"><BellIcon class="size-4" />Reminders</h3>
          <p class="mt-1 text-[13px] text-fg-muted">When to hear about this unit.</p>
          <div class="mt-4 space-y-4">
            <div>
              <Switch :model-value="true"><span class="font-medium">New notes</span></Switch>
              <p class="mt-1 pl-11 text-xs text-fg-muted">As soon as one is published.</p>
            </div>
            <div>
              <Switch><span class="font-medium">Due dates</span></Switch>
              <p class="mt-1 pl-11 text-xs text-fg-muted">A day before each one.</p>
            </div>
          </div>
          <p class="mt-6 text-[17px] font-bold text-fg">22 <span class="text-sm font-normal text-fg-muted">notes this unit</span></p>
        </aside>
      </div>`,
  }),
}

/** On the scale: one title leads, colour ranks the rest, weight only says read, act or announce. */
export const Rules: Story = {
  render: () => ({
    components: { Button, Switch, BellIcon, PlusIcon },
    setup: () => ({ notes }),
    template: `
      <div class="mx-auto grid max-w-4xl gap-8 md:grid-cols-[1fr_16rem] md:items-start">
        <main>
          <p class="t-meta text-fg-muted">Web server · Unit 3</p>
          <h1 class="t-display mt-1">Networks</h1>
          <p class="t-copy mt-2 text-fg-secondary">Everything we saw about how machines find and talk to each other.</p>
          <div class="mt-5 flex gap-2">
            <Button><PlusIcon class="size-4" />New note</Button>
            <Button variant="outline">Share</Button>
          </div>
          <h2 class="t-label mt-10 text-fg-muted">This week</h2>
          <ul class="mt-2 divide-y divide-border">
            <li v-for="n in notes" :key="n.title" class="flex items-baseline gap-4 py-3">
              <div class="min-w-0 flex-1">
                <p class="t-label text-fg">{{ n.title }}</p>
                <p class="t-ui mt-0.5 text-fg-muted">{{ n.excerpt }}</p>
              </div>
              <span class="t-meta text-fg-muted">{{ n.count }} parts · {{ n.date }}</span>
            </li>
          </ul>
        </main>
        <aside class="rounded-[var(--radius-xl)] bg-surface p-5">
          <h3 class="t-label flex items-center gap-2 text-fg"><BellIcon class="size-4 text-fg-muted" />Reminders</h3>
          <p class="t-meta mt-1 text-fg-muted">When to hear about this unit.</p>
          <div class="mt-4 space-y-4">
            <div>
              <Switch :model-value="true"><span class="t-ui">New notes</span></Switch>
              <p class="t-meta mt-1 pl-11 text-fg-muted">As soon as one is published.</p>
            </div>
            <div>
              <Switch><span class="t-ui">Due dates</span></Switch>
              <p class="t-meta mt-1 pl-11 text-fg-muted">A day before each one.</p>
            </div>
          </div>
          <p class="t-meta mt-6 text-fg-muted"><span class="t-title mr-1.5">22</span>notes this unit</p>
        </aside>
      </div>`,
  }),
}
