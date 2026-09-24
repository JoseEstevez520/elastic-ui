import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import SearchMorph from './SearchMorph.vue'

const PAGES = ['Web client', 'Web server', 'Deployment', 'Design', 'Timetable', 'Tools', 'AI', 'Final project ideas']

const meta = {
  title: 'Special/SearchMorph',
  // Top-aligned: centering would re-center the search as it widens, and the icon would drift.
  parameters: { layout: 'padded' },
  render: () => ({
    components: { SearchMorph },
    setup: () => ({ query: ref('') }),
    template: `
      <div class="flex flex-col items-start gap-2">
        <SearchMorph v-model="query" shortcut="/" />
        <p class="text-sm text-fg-muted">Press the magnifier, or <kbd class="rounded border border-border px-1 font-mono text-xs">/</kbd> anywhere.</p>
      </div>`,
  }),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** A magnifier that opens into the field around it, with no box, as Apple's; left empty, it folds back. */
export const Default: Story = {}

/** In a header, lined up with the end: it grows towards the start, and the rest makes way. */
export const InHeader: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { SearchMorph },
    setup() {
      const query = ref('')
      const found = computed(() => PAGES.filter((p) => p.toLowerCase().includes(query.value.toLowerCase())))
      return { query, found }
    },
    template: `
      <div>
        <header class="flex h-14 items-center gap-4 px-4">
          <span class="text-sm font-semibold text-fg">Class repo</span>
          <nav class="flex gap-4 text-sm text-fg-secondary">
            <span>Modules</span><span>Tools</span><span>AI</span>
          </nav>
          <SearchMorph v-model="query" shortcut="mod+k" class="ml-auto" placeholder="Search pages" />
        </header>
        <ul v-if="query" class="mx-4 flex flex-col gap-1 text-sm text-fg">
          <li v-for="page in found" :key="page">{{ page }}</li>
          <li v-if="!found.length" class="text-fg-muted">Nothing matches.</li>
        </ul>
      </div>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** A faint fill and no border, for a search that needs to read as a field. */
export const Soft: Story = {
  render: () => ({
    components: { SearchMorph },
    template: `<SearchMorph variant="soft" placeholder="Search students" />`,
  }),
}

/** A narrower field, set with `--search-width`. */
export const Narrow: Story = {
  render: () => ({
    components: { SearchMorph },
    template: `<SearchMorph class="[--search-width:11rem]" placeholder="Filter" />`,
  }),
}
