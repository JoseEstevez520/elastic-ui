import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Aurora } from '../aurora'
import { Button } from '../button'
import { ThemeToggle } from '../theme-toggle'
import StickyHeader from './StickyHeader.vue'

const LINKS = ['Projects', 'About', 'Skills', 'Contact', 'Blog', 'Talks', 'Uses', 'Now']

interface HeaderArgs {
  seamless: boolean
  clear: boolean
  /** How many links the bar shows. */
  links: number
  /** Swaps in labels far longer than usual. */
  longLabels: boolean
  /** Shows the theme toggle in the actions slot. */
  actions: boolean
}

// `args` stays reactive, so the Controls panel updates the header without remounting it.
const page = (args: HeaderArgs) => ({
  components: { StickyHeader, Aurora, Button, ThemeToggle },
  setup: () => ({
    args,
    links: () => LINKS.slice(0, args.links),
    label: (link: string) => (args.longLabels ? `${link} and everything around it` : link),
  }),
  template: `
    <StickyHeader :seamless="args.seamless" :clear="args.clear">
      <template #logo>
        <span class="font-semibold tracking-tight">elastic</span>
      </template>

      <Button v-for="link in links()" :key="link" :href="'#' + link.toLowerCase()" variant="ghost" size="sm">
        {{ label(link) }}
      </Button>

      <template v-if="args.actions" #actions>
        <ThemeToggle />
      </template>
    </StickyHeader>

    <Aurora v-if="args.clear" class="-mt-14 flex min-h-[70svh] items-center justify-center px-6 pt-14 text-center">
      <p class="text-display text-fg">The page opens on colour, and the bar lets it through.</p>
    </Aurora>

    <main class="mx-auto flex w-[86%] flex-col gap-6 pt-12 pb-20 text-fg-secondary sm:w-[60%]">
      <p class="text-2xl font-semibold text-fg">Scroll down: the bar stays and the page blurs behind it.</p>
      <p>Nothing moves to make room for it; below 48rem the links fold away.</p>
      <p v-for="n in 30" :key="n">Paragraph {{ n }} of filler content so the page can scroll.</p>
    </main>`,
})

const meta = {
  title: 'Navigation/StickyHeader',
  parameters: { layout: 'fullscreen' },
  args: { seamless: false, clear: false, links: 4, longLabels: false, actions: true },
  argTypes: {
    links: { control: { type: 'range', min: 1, max: LINKS.length, step: 1 } },
  },
  render: (args) => page(args),
} satisfies Meta<HeaderArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** No hairline under it, even once the page has moved. */
export const Seamless: Story = {
  args: { seamless: true },
}

/**
 * No veil at the top, over a page that opens on an Aurora: the colour runs up behind the bar, and
 * the veil comes in with the hairline once the page moves.
 */
export const Clear: Story = {
  args: { clear: true },
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

export const ManyLinks: Story = {
  args: { links: LINKS.length },
}

export const LongLabels: Story = {
  args: { longLabels: true },
}

export const NoActions: Story = {
  args: { actions: false },
}

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
