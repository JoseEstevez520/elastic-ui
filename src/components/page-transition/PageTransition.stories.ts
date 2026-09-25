import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { BookOpen, Bot, Container } from '@lucide/vue'
import { computed, ref } from 'vue'
import Breadcrumbs from '../breadcrumbs/Breadcrumbs.vue'
import NavTree from '../nav-tree/NavTree.vue'
import NavTreeItem from '../nav-tree/NavTreeItem.vue'
import Sidebar from '../sidebar/Sidebar.vue'
import SidebarLayout from '../sidebar/SidebarLayout.vue'
import SidebarLayoutHeader from '../sidebar/SidebarLayoutHeader.vue'
import PageTransition from './PageTransition.vue'

const PAGES = {
  agents: {
    title: 'Coding agents',
    icon: Bot,
    paragraphs: [
      'A coding agent is a model with a harness: the tools, instructions and permissions that let it work in your project.',
      'The model is the same one you chat with; the harness changes what it can reach.',
      'Permissions decide what it may do without you: edit, run commands, or ask first.',
    ],
  },
  containers: {
    title: 'Containers',
    icon: Container,
    paragraphs: [
      'A container runs an app with everything it needs, the same way on your laptop and on the server.',
      'It starts from an image, built once from a Dockerfile, layer on layer.',
      'Every run of the image is a container of its own, with its own files.',
    ],
  },
  git: {
    title: 'Git',
    icon: BookOpen,
    paragraphs: [
      'Git keeps the history of a project as commits, each a snapshot with a message.',
      'A branch is a line of commits of its own; merging joins it back.',
      'Push sends your commits to the shared repository; pull brings the others in.',
    ],
  },
} as const

const meta = {
  title: 'Navigation/PageTransition',
  component: PageTransition,
  parameters: { layout: 'fullscreen' },
  args: { page: 'agents' },
  render: () => ({
    components: { Breadcrumbs, NavTree, NavTreeItem, PageTransition, Sidebar, SidebarLayout, SidebarLayoutHeader },
    setup() {
      const page = ref<keyof typeof PAGES>('agents')
      const current = computed(() => PAGES[page.value])
      const crumbs = computed(() => [{ label: 'Notes', href: '#' }, { label: current.value.title }])
      return { page, current, crumbs, PAGES }
    },
    template: `
      <SidebarLayout>
        <Sidebar variant="connected">
          <template #header><span class="px-2.5 text-sm font-semibold">Class notes</span></template>
          <NavTree v-model="page">
            <NavTreeItem v-for="(p, key) in PAGES" :key="key" :value="key" :icon="p.icon">{{ p.title }}</NavTreeItem>
          </NavTree>
        </Sidebar>
        <div class="min-w-0 flex-1">
          <SidebarLayoutHeader><Breadcrumbs :items="crumbs" /></SidebarLayoutHeader>
          <PageTransition :page="page">
            <article class="prose article py-12">
              <h1>{{ current.title }}</h1>
              <p v-for="text in current.paragraphs" :key="text">{{ text }}</p>
              <p v-for="n in 12" :key="n" class="text-fg-muted">More of the page, to scroll down before going to the next one.</p>
            </article>
          </PageTransition>
        </div>
      </SidebarLayout>`,
  }),
} satisfies Meta<typeof PageTransition>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Go from page to page in the sidebar: the sidebar, the header and the breadcrumbs stay; the page
 * that goes fades, the scroll is back at the top, and the next fades in, lightly. Scroll down first
 * to see the scroll come back up.
 */
export const Default: Story = {}
