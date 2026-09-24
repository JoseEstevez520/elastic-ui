import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TableOfContents, { type TableOfContentsItem } from './TableOfContents.vue'

const items: TableOfContentsItem[] = [
  { id: 'what-is-an-agent', label: 'What is an agent' },
  { id: 'the-model', label: 'The model', level: 3 },
  { id: 'the-harness', label: 'The harness', level: 3 },
  { id: 'the-loop', label: 'Reading, deciding and acting: the loop that makes it work' },
  { id: 'tools', label: 'Tools' },
  { id: 'files', label: 'Files', level: 3 },
  { id: 'commands', label: 'Commands', level: 3 },
  { id: 'when-to-use-one', label: 'When to use one' },
  { id: 'summary', label: 'Summary' },
]

const PARAGRAPH =
  'A coding agent reads your project, decides what to change and changes it, then looks at what happened and decides again. Each part of that loop is simple on its own; what makes it useful is how they fit together, and how much of your project the model can see while it works.'

const meta = {
  title: 'Special/TableOfContents',
  component: TableOfContents,
  parameters: { layout: 'fullscreen' },
  args: { items },
  render: () => ({
    components: { TableOfContents },
    setup: () => ({ items, PARAGRAPH }),
    template: `
      <div class="mx-auto grid max-w-5xl gap-16 px-6 py-16 lg:grid-cols-[1fr_14rem]">
        <article class="min-w-0">
          <h1 class="mb-8 text-3xl font-semibold">Coding agents</h1>
          <template v-for="(item, i) in items" :key="item.id">
            <component
              :is="item.level === 3 ? 'h3' : 'h2'"
              :id="item.id"
              :class="[item.level === 3 ? 'mt-8 text-lg' : 'mt-12 text-xl', 'mb-3 scroll-mt-24 font-semibold outline-none']"
            >{{ item.label }}</component>
            <p v-for="n in (i % 3) + 1" :key="n" class="mb-4 leading-relaxed text-fg-secondary">{{ PARAGRAPH }}</p>
          </template>
        </article>
        <TableOfContents :items="items" class="sticky top-16 hidden self-start lg:block" />
      </div>`,
  }),
} satisfies Meta<typeof TableOfContents>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Scroll the article: the mark slides to the section you are reading, taking its height, a
 * subsection one step in. Click a section and the page scrolls there while the mark goes straight
 * to it. A long label wraps, and the mark grows with it.
 */
export const Default: Story = {}
