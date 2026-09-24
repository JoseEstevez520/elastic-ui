import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Bell, CircleCheck, Clock, GitBranch, Star, Tag } from '@lucide/vue'
import { siDocker, siGit, siLaravel, siLinux, siMysql, siNodedotjs, siPostgresql, siTailwindcss, siVuedotjs, type SimpleIcon } from 'simple-icons'
import { h, ref, type FunctionalComponent } from 'vue'
import AnimatedList from '../animated-list/AnimatedList.vue'
import Button from '../button/Button.vue'
import Badge from './Badge.vue'
import BadgeCount from './BadgeCount.vue'

// The library ships no icons; Lucide stands in for a project's own, and Simple Icons for brand logos.
const icons = { Bell, CircleCheck, Clock, GitBranch, Star, Tag }

/** A technology's logo in its own colour, as an icon component for a Badge. */
const logo = (icon: SimpleIcon): FunctionalComponent => () =>
  h('svg', { viewBox: '0 0 24 24', fill: `#${icon.hex}`, 'aria-hidden': 'true' }, [h('path', { d: icon.path })])
const TECH = [siVuedotjs, siTailwindcss, siNodedotjs, siPostgresql, siLaravel, siDocker, siMysql, siLinux, siGit].map(
  (icon) => ({ name: icon.title, icon: logo(icon) }),
)

const meta = {
  title: 'Base/Badge',
  component: Badge,
  args: { variant: 'soft', size: 'md' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['soft', 'outline', 'solid'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  render: (args) => ({
    components: { Badge },
    setup: () => ({ args, icons }),
    template: `<Badge v-bind="args" :icon="icons.Tag">Draft</Badge>`,
  }),
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => ({
    components: { Badge },
    setup: () => ({ icons }),
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <Badge :icon="icons.Clock">Soft</Badge>
        <Badge variant="outline" :icon="icons.GitBranch">Outline</Badge>
        <Badge variant="solid" :icon="icons.Star">Solid</Badge>
        <Badge size="sm">Small</Badge>
      </div>`,
  }),
}

/** A dot in any color, for a status or a category, on an otherwise neutral badge. */
export const WithDot: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <Badge color="#16a34a">Live</Badge>
        <Badge color="#d97706">In review</Badge>
        <Badge color="#a1a1aa">Archived</Badge>
        <Badge variant="outline" color="#2e9bf7">Frontend</Badge>
      </div>`,
  }),
}

/** Folded to its icon or dot; hover or focus unfolds the label beside it. */
export const Compact: Story = {
  render: () => ({
    components: { Badge },
    setup: () => ({ icons }),
    template: `
      <div class="flex items-center gap-2">
        <Badge compact :icon="icons.CircleCheck">Deployed</Badge>
        <Badge compact :icon="icons.Clock">Waiting for review</Badge>
        <Badge compact variant="outline" :icon="icons.GitBranch">main</Badge>
        <Badge compact color="#16a34a">Live</Badge>
      </div>`,
  }),
}

/** Tags that can be taken off: the one removed fades, then the others close the gap. */
export const Removable: Story = {
  render: () => ({
    components: { AnimatedList, Badge, Button },
    setup() {
      const tags = ref(TECH.slice(0, 6))
      const remove = (name: string) => (tags.value = tags.value.filter((t) => t.name !== name))
      return { tags, remove, reset: () => (tags.value = TECH.slice(0, 6)) }
    },
    template: `
      <div class="flex max-w-xs flex-col items-start gap-3">
        <AnimatedList :items="tags" :item-key="(t) => t.name" as="div" class="flex flex-wrap gap-1.5">
          <template #default="{ item }">
            <Badge variant="outline" :icon="item.icon" removable :remove-label="'Remove ' + item.name" @remove="remove(item.name)">
              {{ item.name }}
            </Badge>
          </template>
          <template #empty><p class="text-sm text-fg-muted">No tags left.</p></template>
        </AnimatedList>
        <Button size="sm" variant="ghost" @click="reset">Reset</Button>
      </div>`,
  }),
}

/** A count: when it changes, the old number blurs out upwards and the new one comes in from below. */
export const Count: Story = {
  render: () => ({
    components: { Badge, BadgeCount, Button },
    setup: () => ({ unread: ref(3), icons }),
    template: `
      <div class="flex items-center gap-3">
        <span class="inline-flex items-center gap-2 text-sm text-fg">
          <component :is="icons.Bell" class="size-4" /> Inbox
          <BadgeCount :value="unread" size="sm" />
        </span>
        <Button size="sm" variant="outline" @click="unread++">+1</Button>
        <Button size="sm" variant="ghost" @click="unread = Math.max(0, unread - 1)">−1</Button>
        <Button size="sm" variant="ghost" @click="unread = 120">120</Button>
      </div>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** Tags in a row wrap to the next line rather than squeezing. */
export const ManyTags: Story = {
  render: () => ({
    components: { Badge },
    setup: () => ({ tags: TECH }),
    template: `
      <div class="flex max-w-xs flex-wrap gap-1.5">
        <Badge v-for="tag in tags" :key="tag.name" variant="outline" :icon="tag.icon">{{ tag.name }}</Badge>
      </div>`,
  }),
}
