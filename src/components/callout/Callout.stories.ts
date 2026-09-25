import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Callout from './Callout.vue'

const meta = {
  title: 'Content/Callout',
  component: Callout,
  render: () => ({
    components: { Callout },
    template: `
      <div class="flex max-w-xl flex-col gap-4">
        <Callout type="note">The practice is handed in through the virtual classroom, not by email.</Callout>
        <Callout type="tip">Run <code class="font-mono text-[13px]">npm run dev</code> once and leave it open: the page reloads on every save.</Callout>
        <Callout type="important">You need 80% attendance to keep the right to continuous assessment.</Callout>
        <Callout type="warning">The server is reset every Friday; keep a copy of your database.</Callout>
        <Callout type="caution">
          <p>Never push the <code class="font-mono text-[13px]">.env</code> file to the repository.</p>
          <p>If you did, change the passwords at once: removing it later does not take it out of the history.</p>
        </Callout>
        <Callout title="Tuesday's class moves to room 204" />
      </div>`,
  }),
} satisfies Meta<typeof Callout>

export default meta
type Story = StoryObj<typeof meta>

/** The five kinds, as GitHub's alerts; a long one keeps its paragraphs, a title alone stands on its own. */
export const Default: Story = {}
