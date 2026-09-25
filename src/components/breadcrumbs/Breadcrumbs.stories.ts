import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, onBeforeUnmount, ref } from 'vue'
import Breadcrumbs from './Breadcrumbs.vue'
import type { BreadcrumbsItem } from './breadcrumbs.variants'

// A small site to walk through: modules, each with its units. Links go by the URL's hash, so the
// story can follow them without a router.
const MODULES = [
  { slug: 'dwec', label: 'Client-side web development' },
  { slug: 'dwes', label: 'Server-side web development' },
  { slug: 'diw', label: 'Interface design' },
  { slug: 'daw', label: 'Web application deployment' },
]
const UNITS = ['Introduction', 'The language', 'The DOM', 'Events', 'Forms', 'Asynchrony']

function trail(path: string[]): BreadcrumbsItem[] {
  const items: BreadcrumbsItem[] = [{ label: 'Home', href: '#/' }]
  if (path[0] !== 'modules') return items
  items.push({ label: 'Modules', href: '#/modules' })
  const module = MODULES.find((m) => m.slug === path[1])
  if (!module) return items
  items.push({
    label: module.label,
    href: `#/modules/${module.slug}`,
    siblings: MODULES.map((m) => ({ label: m.label, href: `#/modules/${m.slug}` })),
  })
  const unit = Number(path[2])
  if (!unit) return items
  items.push({
    label: UNITS[unit - 1]!,
    href: `#/modules/${module.slug}/${unit}`,
    siblings: UNITS.map((label, i) => ({ label, href: `#/modules/${module.slug}/${i + 1}` })),
  })
  return items
}

/** The path in the URL's hash, followed as it changes; each story starts from its own. */
function useHashPath(start: string) {
  history.replaceState(null, '', start)
  const path = ref(location.hash.slice(2).split('/').filter(Boolean))
  const onChange = () => (path.value = location.hash.slice(2).split('/').filter(Boolean))
  window.addEventListener('hashchange', onChange)
  onBeforeUnmount(() => window.removeEventListener('hashchange', onChange))
  return path
}

const walk = (start: string, width = 'w-[40rem]') => ({
  components: { Breadcrumbs },
  setup() {
    const path = useHashPath(start)
    const items = computed(() => trail(path.value))
    const go = (hash: string) => (location.hash = hash)
    return { items, go }
  },
  template: `
    <div class="flex max-w-full flex-col gap-8 ${width}">
      <Breadcrumbs :items="items" />
      <div class="flex flex-wrap gap-2 text-sm">
        <button type="button" class="rounded-md border border-border px-2 py-1" @click="go('#/modules/dwec/3')">The DOM</button>
        <button type="button" class="rounded-md border border-border px-2 py-1" @click="go('#/modules/dwec/4')">Events</button>
        <button type="button" class="rounded-md border border-border px-2 py-1" @click="go('#/modules/dwes')">Server-side module</button>
        <button type="button" class="rounded-md border border-border px-2 py-1" @click="go('#/')">Home</button>
      </div>
    </div>`,
})

const meta = {
  title: 'Navigation/Breadcrumbs',
  component: Breadcrumbs,
  args: { items: trail(['modules', 'dwec', '3']) },
  render: () => walk('#/modules/dwec/3'),
} satisfies Meta<typeof Breadcrumbs>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Walk the path: a crumb whose page changes morphs into its new name, crumbs added or dropped
 * come into focus or fade. The chevron before a module or a unit opens the others at that level.
 */
export const Default: Story = {}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** Only the top: one crumb, no separators. */
export const One: Story = {
  args: { items: [{ label: 'Home', href: '#/' }] },
  render: (args) => ({ components: { Breadcrumbs }, setup: () => ({ args }), template: '<Breadcrumbs v-bind="args" />' }),
}

/** No siblings anywhere: plain chevrons between the crumbs. */
export const Plain: Story = {
  args: {
    items: [
      { label: 'Home', href: '#/' },
      { label: 'Settings', href: '#/settings' },
      { label: 'Notifications' },
    ],
  },
  render: (args) => ({ components: { Breadcrumbs }, setup: () => ({ args }), template: '<Breadcrumbs v-bind="args" />' }),
}

/** A narrow row, as on a phone: it scrolls, held at the current page, the crumbs above it behind a fading edge. */
export const Narrow: Story = {
  render: () => walk('#/modules/daw/6', 'w-[20rem]'),
}
