import type { Meta, StoryObj } from '@storybook/vue3-vite'
import {
  Code,
  Heading2,
  Heading3,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  SquareCode,
  Table,
} from '@lucide/vue'
import { computed, ref, useTemplateRef } from 'vue'
import Input from '../input/Input.vue'
import SuggestionMenu from './SuggestionMenu.vue'
import SuggestionMenuEmpty from './SuggestionMenuEmpty.vue'
import SuggestionMenuItem from './SuggestionMenuItem.vue'

// The library ships no icons; Lucide stands in for a project's own.
const BLOCKS = [
  { value: 'text', label: 'Text', icon: Pilcrow },
  { value: 'heading', label: 'Heading', icon: Heading2 },
  { value: 'subheading', label: 'Subheading', icon: Heading3 },
  { value: 'list', label: 'List', icon: List },
  { value: 'numbered', label: 'Numbered list', icon: ListOrdered },
  { value: 'checklist', label: 'Checklist', icon: ListChecks },
  { value: 'quote', label: 'Quote', icon: Quote },
  { value: 'code', label: 'Code', icon: SquareCode },
  { value: 'inline-code', label: 'Inline code, for a command or a file name in a sentence', icon: Code },
  { value: 'table', label: 'Table', icon: Table },
  { value: 'divider', label: 'Divider', icon: Minus },
]

const parts = { Input, SuggestionMenu, SuggestionMenuItem, SuggestionMenuEmpty }

/**
 * A field that opens the menu on "/", as an editor would: what follows the slash filters the
 * blocks, the arrows move, Enter picks and Escape closes. The field keeps the focus throughout.
 */
function field(initial = '') {
  return {
    components: parts,
    setup() {
      const text = ref(initial)
      const open = ref(Boolean(initial.startsWith('/')))
      const highlighted = ref<string>()
      const picked = ref('')
      const wrapper = useTemplateRef<HTMLElement>('wrapper')
      const menu = useTemplateRef<InstanceType<typeof SuggestionMenu>>('menu')
      const query = computed(() => (text.value.startsWith('/') ? text.value.slice(1).toLowerCase() : ''))
      const found = computed(() => BLOCKS.filter((block) => block.label.toLowerCase().includes(query.value)))
      const reference = ref<DOMRect | null>(null)

      function onInput() {
        open.value = text.value.startsWith('/')
        reference.value = wrapper.value?.getBoundingClientRect() ?? null
      }
      function onKey(event: KeyboardEvent) {
        if (!open.value) return
        if (event.key === 'ArrowDown') menu.value?.next()
        else if (event.key === 'ArrowUp') menu.value?.previous()
        else if (event.key === 'Enter') menu.value?.pick()
        else return
        event.preventDefault()
      }
      function onSelect(value: string) {
        picked.value = BLOCKS.find((block) => block.value === value)?.label ?? value
        text.value = ''
        open.value = false
      }
      return { text, open, highlighted, picked, found, reference, onInput, onKey, onSelect }
    },
    mounted(this: { onInput: () => void }) {
      this.onInput()
    },
    template: `
      <div class="flex w-[min(28rem,100%)] flex-col gap-3">
        <div ref="wrapper">
          <Input v-model="text" placeholder="Type / for a block" aria-label="Text" @input="onInput" @keydown="onKey" />
        </div>
        <p class="text-meta text-fg-muted">{{ picked ? 'Picked: ' + picked : 'Nothing picked yet' }}</p>
        <SuggestionMenu ref="menu" v-model:open="open" v-model="highlighted" :reference="reference" @select="onSelect">
          <SuggestionMenuItem v-for="block in found" :key="block.value" :value="block.value" :icon="block.icon">
            {{ block.label }}
          </SuggestionMenuItem>
          <SuggestionMenuEmpty v-if="!found.length" />
        </SuggestionMenu>
      </div>`,
  }
}

const meta = {
  title: 'Overlays/SuggestionMenu',
  component: SuggestionMenu,
  parameters: { layout: 'centered' },
  render: () => field(),
} satisfies Meta<typeof SuggestionMenu>

export default meta
type Story = StoryObj<typeof meta>

/** Type "/" in the field: the blocks open under it, and "/co" leaves the two kinds of code. */
export const Default: Story = {}

/** Open from the start, with every block: a dozen items scroll inside the list, never the page. */
export const Many: Story = { render: () => field('/') }

/** Nothing matches: the menu says so in the library's words, and Enter picks nothing. */
export const NothingMatches: Story = { render: () => field('/zzz') }
