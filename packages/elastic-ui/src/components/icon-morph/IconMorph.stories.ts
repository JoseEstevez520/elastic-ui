import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import type { GlyphName } from './glyphs'
import IconMorph from './IconMorph.vue'

const pairs: [GlyphName, GlyphName, string][] = [
  ['menu', 'close', 'Menu'],
  ['play', 'pause', 'Play'],
  ['plus', 'minus', 'Add'],
  ['plus', 'close', 'Add, then close'],
  ['chevronDown', 'chevronUp', 'Open'],
  ['chevronRight', 'chevronDown', 'Expand'],
  ['arrowRight', 'check', 'Send, then done'],
  ['arrowUp', 'check', 'Upload, then done'],
  ['arrowDown', 'check', 'Download, then done'],
  ['arrowLeft', 'close', 'Back, then close'],
]

const meta = { title: 'Text/IconMorph', component: IconMorph, args: { icon: 'menu' } } satisfies Meta<typeof IconMorph>
export default meta
type Story = StoryObj<typeof meta>

/** Press each: its strokes travel into the other icon, as TextMorph's letters do. */
export const Pairs: Story = {
  render: () => ({
    components: { IconMorph },
    setup: () => ({ pairs, on: ref(pairs.map(() => false)) }),
    template: `
      <div class="grid max-w-xl grid-cols-3 gap-4">
        <button
          v-for="([a, b, label], i) in pairs"
          :key="label"
          type="button"
          :aria-pressed="on[i]"
          class="flex cursor-pointer flex-col items-center gap-3 rounded-2xl bg-bg-muted px-4 py-6 text-fg transition-colors hover:text-fg-secondary focus-ring"
          @click="on[i] = !on[i]"
        >
          <IconMorph :icon="on[i] ? b : a" class="size-7" />
          <span class="text-xs text-fg-muted">{{ label }}</span>
        </button>
      </div>`,
  }),
}

/** In a button, where it lives: the button is named, the icon only drawn. */
export const InAButton: Story = {
  render: () => ({
    components: { IconMorph },
    setup: () => ({ open: ref(false) }),
    template: `
      <button type="button" :aria-label="open ? 'Close menu' : 'Open menu'" :aria-expanded="open" class="flex size-10 cursor-pointer items-center justify-center rounded-xl bg-bg-muted text-fg focus-ring" @click="open = !open">
        <IconMorph :icon="open ? 'close' : 'menu'" class="size-5" />
      </button>`,
  }),
}
