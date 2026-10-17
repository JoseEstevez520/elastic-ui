import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TerminalReplay from './TerminalReplay.vue'

const meta = {
  title: 'Code/TerminalReplay',
  component: TerminalReplay,
  args: {
    title: '~/tasks-api',
    entries: [
      { comment: 'Start the project and add Express', command: 'npm init -y && npm install express', duration: 1100, output: 'added 65 packages in 2s' },
      { comment: 'Run the tests', command: 'npm test', duration: 900, output: '> node --test\n\n✔ lists the tasks\n✔ creates a task\n✖ rejects a task without a title\n\n2 passed, 1 failed' },
      { command: 'git add . && git commit -m "Reject tasks without a title"', output: '[main 3f2c1a8] Reject tasks without a title\n 1 file changed, 4 insertions(+), 2 deletions(-)' },
    ],
  },
  render: (args) => ({
    components: { TerminalReplay },
    setup: () => ({ args }),
    template: `<TerminalReplay v-bind="args" class="max-w-2xl" />`,
  }),
} satisfies Meta<typeof TerminalReplay>

export default meta
type Story = StoryObj<typeof meta>

/**
 * It plays once in view: each command comes in word by word under its comment, runs a moment, and
 * what it printed comes in line by line, passes in green and failures in red. The block keeps its
 * size throughout; replay it from the caption, and copy takes the commands alone.
 */
export const Default: Story = {}
