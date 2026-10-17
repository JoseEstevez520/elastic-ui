import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Copy, Languages, MessageSquare, Sparkles } from '@lucide/vue'
import { ref } from 'vue'
import SelectionMenu from './SelectionMenu.vue'
import SelectionMenuItem from './SelectionMenuItem.vue'

const icons = { Copy, Languages, MessageSquare, Sparkles }

const meta = {
  title: 'Overlays/SelectionMenu',
  // Top-aligned, and with room above the text, so the bar has somewhere to sit.
  render: () => ({
    components: { SelectionMenu, SelectionMenuItem },
    setup() {
      const last = ref('')
      const act = (what: string) => (text: string) => (last.value = `${what}: “${text}”`)
      return { last, act, copy: (text: string) => navigator.clipboard.writeText(text), icons }
    },
    template: `
      <div class="max-w-xl pt-16">
        <SelectionMenu label="Article">
          <h2 class="mb-2 text-lg font-semibold text-fg">What a harness is</h2>
          <p class="leading-relaxed text-fg-secondary">
            A coding agent is a model inside a harness. The model reads and writes text; the harness gives it
            its eyes and hands: it reads your project, edits files and runs commands, then shows the model
            what happened so it can decide the next step. Select any words to act on them.
          </p>
          <template #actions>
            <SelectionMenuItem :icon="icons.Sparkles" @select="act('Explain')">Explain</SelectionMenuItem>
            <SelectionMenuItem :icon="icons.MessageSquare" @select="act('Comment')">Comment</SelectionMenuItem>
            <SelectionMenuItem :icon="icons.Languages" @select="act('Translate')">Translate</SelectionMenuItem>
            <SelectionMenuItem :icon="icons.Copy" aria-label="Copy" @select="copy" />
          </template>
        </SelectionMenu>
        <p class="mt-6 text-sm text-fg-muted">{{ last || 'Select some text, then pick an action.' }}</p>
      </div>`,
  }),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Select words: they snap to whole words and turn into one rounded band, with actions above. */
export const Default: Story = {}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** Near the top of the screen there is no room above, so the bar sits below the selection. */
export const NearTop: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { SelectionMenu, SelectionMenuItem },
    setup: () => ({ icons }),
    template: `
      <SelectionMenu class="p-2">
        <p class="text-fg">Select a word in this first line: the bar has no room above and opens below it.</p>
        <template #actions>
          <SelectionMenuItem :icon="icons.Copy">Copy</SelectionMenuItem>
        </template>
      </SelectionMenu>`,
  }),
}
