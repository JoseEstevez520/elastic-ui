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
  ['arrowRight', 'check', 'Send, then done'],
]

const meta = { title: 'Lab/Icon morph' } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/** Press each: its strokes travel into the other icon. */
export const Morph: Story = {
  render: () => ({
    components: { IconMorph },
    setup: () => ({ pairs, on: ref(pairs.map(() => false)) }),
    template: `
      <div class="grid max-w-xl grid-cols-3 gap-4">
        <button
          v-for="([a, b, label], i) in pairs"
          :key="label"
          type="button"
          class="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-[color:var(--color-border)] px-4 py-6 text-fg transition-colors hover:bg-bg-muted focus-ring"
          @click="on[i] = !on[i]"
        >
          <IconMorph :icon="on[i] ? b : a" class="size-7" />
          <span class="text-xs text-fg-muted">{{ label }}</span>
        </button>
      </div>`,
  }),
}
