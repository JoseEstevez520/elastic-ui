import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CopyButton from './CopyButton.vue'

const meta = {
  title: 'Base/CopyButton',
  component: CopyButton,
  args: { value: 'npm install elastic-ui' },
} satisfies Meta<typeof CopyButton>

export default meta
type Story = StoryObj<typeof meta>

/** Copy turns into a check once copied, and back after two seconds. */
export const Default: Story = {
  render: () => ({
    components: { CopyButton },
    template: `
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 rounded-md border border-border py-1 pr-1 pl-3 font-mono text-sm text-fg">
          npm install elastic-ui
          <CopyButton value="npm install elastic-ui" class="size-8" />
        </div>
        <CopyButton value="https://example.com/share/123" variant="outline" size="sm" label="Copy link" copied-label="Link copied" />
      </div>`,
  }),
}
