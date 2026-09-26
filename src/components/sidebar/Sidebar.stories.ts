import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { BookOpen, Bot, Calendar, House, Settings, Wrench } from '@lucide/vue'
import { ref } from 'vue'
import NavTree from '../nav-tree/NavTree.vue'
import NavTreeGroup from '../nav-tree/NavTreeGroup.vue'
import NavTreeItem from '../nav-tree/NavTreeItem.vue'
import Sidebar from './Sidebar.vue'
import SidebarLayout from './SidebarLayout.vue'
import PageTitle from './PageTitle.vue'
import SidebarLayoutHeader from './SidebarLayoutHeader.vue'
import SidebarToggle from './SidebarToggle.vue'

// The library ships no icons; Lucide stands in for a project's own.
const icons = { home: House, book: BookOpen, wrench: Wrench, bot: Bot, calendar: Calendar, settings: Settings }

const parts = { NavTree, NavTreeGroup, NavTreeItem, PageTitle, Sidebar, SidebarLayout, SidebarLayoutHeader, SidebarToggle }

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
            <p v-for="n in 30" :key="n" class="mt-4">Scroll: the page's header stays at the top, and what goes under it fades and blurs into it along a soft edge.</p>
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
 * A large title, as iOS's: scrolled, it fades and blurs as it goes under the bar, and the bar then
 * shows it, small. Scroll back up and it comes out again.
 */
export const WithPageTitle: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ icons }),
    template: `
      <SidebarLayout>
        <Sidebar>
          <NavTree model-value="home">
            <NavTreeItem value="home" :icon="icons.home">Home</NavTreeItem>
            <NavTreeItem value="notes" :icon="icons.book">Notes</NavTreeItem>
          </NavTree>
        </Sidebar>
        <main class="min-w-0 flex-1">
          <SidebarLayoutHeader />
          <div class="max-w-2xl px-6 pb-6 text-sm text-fg-secondary">
            <PageTitle class="mt-4 mb-6">Agents in OpenCode</PageTitle>
            <p v-for="n in 30" :key="n" class="mt-4">An agent is a model with tools and a loop: it reads, acts, checks what happened and goes on until the work is done.</p>
          </div>
        </main>
      </SidebarLayout>`,
  }),
}
