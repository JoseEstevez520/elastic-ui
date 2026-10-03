import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ThemeToggle } from '../theme-toggle'
import MorphHeader from './MorphHeader.vue'
import MorphHeaderLink from './MorphHeaderLink.vue'
import MorphHeaderNav from './MorphHeaderNav.vue'

const LINKS = ['Projects', 'About', 'Background', 'Skills', 'Contact', 'Blog', 'Talks', 'Uses', 'Now']

interface HeaderArgs {
  menu: 'responsive' | 'scrolled' | 'always'
  scrollThreshold: number
  /** How many links the nav shows. */
  links: number
  /** Swaps in labels far longer than usual. */
  longLabels: boolean
  /** Shows the theme toggle in the actions slot. */
  actions: boolean
}

// `args` stays reactive, so the Controls panel updates the header without remounting it.
const page = (args: HeaderArgs) => ({
  components: { MorphHeader, MorphHeaderNav, MorphHeaderLink, ThemeToggle },
  setup: () => ({
    args,
    links: () => LINKS.slice(0, args.links),
    label: (link: string) => (args.longLabels ? `${link} and everything around it` : link),
  }),
  template: `
    <MorphHeader :menu="args.menu" :scroll-threshold="args.scrollThreshold">
      <template #logo>
        <span class="font-semibold tracking-tight">elastic</span>
      </template>

      <MorphHeaderNav>
        <MorphHeaderLink v-for="link in links()" :key="link" :href="'#' + link.toLowerCase()">
          {{ label(link) }}
        </MorphHeaderLink>
      </MorphHeaderNav>

      <template v-if="args.actions" #actions>
        <ThemeToggle />
      </template>
    </MorphHeader>

    <main class="mx-auto flex w-[86%] flex-col gap-6 pt-40 pb-20 text-fg-secondary sm:w-[60%]">
      <p class="text-2xl font-semibold text-fg">Scroll down to see the bar turn into a pill.</p>
      <p>Below 64rem the links move behind the menu button; opening it grows the pill into a panel.</p>
      <p v-for="n in 30" :key="n">Paragraph {{ n }} of filler content so the page can scroll.</p>
    </main>`,
})

const meta = {
  title: 'Navigation/MorphHeader',
  parameters: { layout: 'fullscreen' },
  args: { menu: 'responsive', scrollThreshold: 40, links: 5, longLabels: false, actions: true },
  argTypes: {
    menu: { control: 'inline-radio', options: ['responsive', 'scrolled', 'always'] },
    links: { control: { type: 'range', min: 1, max: LINKS.length, step: 1 } },
  },
  render: (args) => page(args),
} satisfies Meta<HeaderArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Only the logo and the menu button, at every width. */
/** The links at the top of the page; scrolled, the pill holds only the logo and the menu button. */
export const MenuWhenScrolled: Story = {
  args: { menu: 'scrolled' },
}

export const MenuOnly: Story = {
  args: { menu: 'always' },
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

export const ManyLinks: Story = {
  args: { links: LINKS.length },
}

export const LongLabels: Story = {
  args: { longLabels: true },
}

export const SingleLink: Story = {
  args: { links: 1 },
}

export const NoActions: Story = {
  args: { actions: false },
}

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
