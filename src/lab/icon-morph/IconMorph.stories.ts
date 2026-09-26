import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Check, ChevronDown, ChevronUp, Menu, Minus, Pause, Play, Plus, X, ArrowRight } from '@lucide/vue'
import { ref } from 'vue'
import IconSwap from '../../components/icon-swap/IconSwap.vue'
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
const lucide = {
  menu: Menu,
  close: X,
  play: Play,
  pause: Pause,
  plus: Plus,
  minus: Minus,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  arrowRight: ArrowRight,
  check: Check,
}

const meta = { title: 'Lab/Icon morph' } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const scene = (morph: boolean) => ({
  components: { IconMorph, IconSwap },
  setup: () => ({ pairs, on: ref(pairs.map(() => false)), lucide, morph }),
  template: `
    <div class="grid max-w-xl grid-cols-3 gap-4">
      <button
        v-for="([a, b, label], i) in pairs"
        :key="label"
        type="button"
        class="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-[color:var(--color-border)] px-4 py-6 text-fg transition-colors hover:bg-bg-muted focus-ring"
        @click="on[i] = !on[i]"
      >
        <IconMorph v-if="morph" :icon="on[i] ? b : a" class="size-7" />
        <IconSwap v-else :icon="lucide[on[i] ? b : a]" class="size-7" />
        <span class="text-xs text-fg-muted">{{ label }}</span>
      </button>
    </div>`,
})

/** Press each: its strokes travel into the other icon. */
export const Morph: Story = { render: () => scene(true) }

/** Today's way, to compare: the icon shrinks and blurs away as the next grows in (IconSwap). */
export const SwapToday: Story = { render: () => scene(false) }
