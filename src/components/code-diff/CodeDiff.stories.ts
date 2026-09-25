import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CodeDiff from './CodeDiff.vue'
import { AFTER, BEFORE } from './code-diff.fixtures'


const meta = {
  title: 'Base/CodeDiff',
  component: CodeDiff,
  args: { before: BEFORE, after: AFTER, file: 'server.js' },
  render: (args) => ({
    components: { CodeDiff },
    setup: () => ({ args }),
    template: `<CodeDiff v-bind="args" class="max-w-2xl" />`,
  }),
} satisfies Meta<typeof CodeDiff>

export default meta
type Story = StoryObj<typeof meta>

/**
 * An agent's edit, played once as it comes into view: the lines that go turn red, then the new ones
 * open and come in. The routes it leaves alone fold away; replay it from the caption.
 */
export const Default: Story = {}

/** At rest, with no playing: the diff as it stands. */
export const Still: Story = { args: { animate: false } }
