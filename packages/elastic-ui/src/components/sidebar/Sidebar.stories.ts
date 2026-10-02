import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { BookOpen, Bot, Calendar, House, Settings, Wrench } from '@lucide/vue'
import { ref } from 'vue'
import Button from '../button/Button.vue'
import Textarea from '../input/Textarea.vue'
import NavTree from '../nav-tree/NavTree.vue'
import NavTreeGroup from '../nav-tree/NavTreeGroup.vue'
import NavTreeItem from '../nav-tree/NavTreeItem.vue'
import Sidebar from './Sidebar.vue'
import SidebarLayout from './SidebarLayout.vue'
import SidebarLayoutHeader from './SidebarLayoutHeader.vue'
import SidebarToggle from './SidebarToggle.vue'

// The library ships no icons; Lucide stands in for a project's own.
const icons = { home: House, book: BookOpen, wrench: Wrench, bot: Bot, calendar: Calendar, settings: Settings }

const parts = { NavTree, NavTreeGroup, NavTreeItem, Sidebar, SidebarLayout, SidebarLayoutHeader, SidebarToggle }

const meta = {
  title: 'Navigation/Sidebar',
  parameters: { layout: 'fullscreen' },
  args: { variant: 'plain' },
  argTypes: { variant: { control: 'inline-radio', options: ['plain', 'connected'] } },
  render: (args) => ({
    components: parts,
    setup: () => ({ args, page: ref('home'), collapsed: ref(false), icons }),
    template: `
      <SidebarLayout v-model:collapsed="collapsed">
        <!-- Keyed on the variant: a variant is chosen once, so switching it remounts the sidebar. -->
        <Sidebar :key="args.variant" :variant="args.variant">
          <template #header>
            <span class="px-2.5 text-sm font-semibold">Class repo</span>
          </template>
          <NavTree v-model="page">
            <NavTreeItem value="home" :icon="icons.home">Home</NavTreeItem>
            <NavTreeGroup label="Modules" :icon="icons.book" default-open>
              <NavTreeItem value="client">Web client</NavTreeItem>
              <NavTreeItem value="server">Web server</NavTreeItem>
              <NavTreeItem value="deploy">Deployment</NavTreeItem>
            </NavTreeGroup>
            <NavTreeItem value="tools" :icon="icons.wrench">Tools</NavTreeItem>
            <NavTreeItem value="ai" :icon="icons.bot">AI</NavTreeItem>
            <NavTreeItem value="timetable" :icon="icons.calendar">Timetable</NavTreeItem>
          </NavTree>
          <template #footer>
            <NavTree v-model="page" label="Account">
              <NavTreeItem value="settings" :icon="icons.settings">Settings</NavTreeItem>
            </NavTree>
          </template>
        </Sidebar>
        <main class="min-w-0 flex-1">
          <!-- Held at the top as the page scrolls; on a phone it carries the toggle that opens the panel. -->
          <SidebarLayoutHeader>
            <span class="text-sm text-fg-muted">{{ page }}</span>
          </SidebarLayoutHeader>
          <div class="max-w-2xl p-6 text-sm text-fg-secondary">
            <p>The toggle in the sidebar's header folds it to a rail of icons, whose labels come back as tooltips. Opening a group from the rail unfolds the sidebar. Below 768px the sidebar becomes a panel that slides in from the left, opened from the page's header.</p>
            <p v-for="n in 30" :key="n" class="mt-4">Scroll: the page's header stays at the top, a hairline appearing under it once the page moves.</p>
          </div>
        </main>
      </SidebarLayout>`,
  }),
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

/** A column in a slightly different tone, with no line between it and the page. */
export const Default: Story = {}

/** As in SkillNet: a tinted column whose active item is a tab of the page, curving into it. */
export const Connected: Story = { args: { variant: 'connected' } }

/** Starts folded to the rail; the group holding the active page stands in for it. */
export const Collapsed: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ page: ref('server'), collapsed: ref(true), icons }),
    template: `
      <SidebarLayout v-model:collapsed="collapsed">
        <Sidebar>
          <NavTree v-model="page">
            <NavTreeItem value="home" :icon="icons.home">Home</NavTreeItem>
            <NavTreeGroup label="Modules" :icon="icons.book">
              <NavTreeItem value="client">Web client</NavTreeItem>
              <NavTreeItem value="server">Web server</NavTreeItem>
            </NavTreeGroup>
            <NavTreeItem value="tools" :icon="icons.wrench">Tools</NavTreeItem>
          </NavTree>
        </Sidebar>
        <main class="flex-1 p-4"><SidebarToggle class="md:hidden" /></main>
      </SidebarLayout>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** Labels much longer than in English stay on their lines as the sidebar folds. */
export const LongLabels: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ page: ref('a'), icons }),
    template: `
      <SidebarLayout>
        <Sidebar>
          <NavTree v-model="page">
            <NavTreeItem value="a" :icon="icons.settings">Configuración de privacidad avanzada</NavTreeItem>
            <NavTreeItem value="b" :icon="icons.calendar">Calendario de exámenes y entregas</NavTreeItem>
          </NavTree>
        </Sidebar>
        <main class="flex-1 p-4"><SidebarToggle class="md:hidden" /></main>
      </SidebarLayout>`,
  }),
}

/** On a phone the sidebar is a panel that slides in from the edge. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: meta.render,
}

/**
 * The page alone, for writing: `bare` folds the sidebar away to the edge and the header up, the
 * content first and then the room; pressed again, or Escape, both come back the way they went.
 * The page is never drawn again, so a half-written line keeps its place.
 */
export const Bare: Story = {
  render: () => ({
    components: { ...parts, Button, Textarea },
    setup() {
      const bare = ref(false)
      return { bare, page: ref('home'), icons }
    },
    template: `
      <SidebarLayout :bare="bare" @keydown.esc="bare = false">
        <Sidebar variant="connected">
          <template #header>
            <span class="px-2.5 text-sm font-semibold">Class repo</span>
          </template>
          <NavTree v-model="page">
            <NavTreeItem value="home" :icon="icons.home">Home</NavTreeItem>
            <NavTreeItem value="tools" :icon="icons.wrench">Tools</NavTreeItem>
          </NavTree>
        </Sidebar>
        <main class="min-w-0 flex-1">
          <SidebarLayoutHeader>
            <span class="text-sm text-fg-muted">Notes</span>
          </SidebarLayoutHeader>
          <div class="mx-auto flex max-w-2xl flex-col gap-4 p-6">
            <Button variant="ghost" size="sm" class="self-start" @click="bare = !bare">
              {{ bare ? 'Show the sidebar' : 'Only the page' }}
            </Button>
            <Textarea placeholder="Start writing…" aria-label="Notes" />
          </div>
        </main>
      </SidebarLayout>`,
  }),
}
