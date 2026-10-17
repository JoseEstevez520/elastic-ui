import type { Meta, StoryObj } from '@storybook/vue3-vite'
import PageNav from './PageNav.vue'
import PageNavLink from './PageNavLink.vue'

interface NavArgs {
  /** Whether there is a page before this one. */
  previous: boolean
  /** Whether there is a page after this one. */
  next: boolean
  /** Swaps in titles and descriptions far longer than usual. */
  longText: boolean
}

// `args` stays reactive, so the Controls panel updates the navigation without remounting it.
const page = (args: NavArgs) => ({
  components: { PageNav, PageNavLink },
  setup: () => ({ args }),
  template: `
    <div class="mx-auto max-w-2xl py-10">
      <PageNav>
        <PageNavLink v-if="args.previous" direction="previous" href="#install">
          {{ args.longText ? 'Installing the library in a project that already has a router and a theme' : 'Install' }}
        </PageNavLink>
        <PageNavLink
          v-if="args.next"
          direction="next"
          href="#tokens"
          :description="args.longText ? 'Every colour, size and curve the library draws with, and how to change them for a whole project' : 'The values everything is drawn with.'"
        >
          {{ args.longText ? 'Design tokens and the three levels of customization' : 'Tokens' }}
        </PageNavLink>
      </PageNav>
    </div>`,
})

const meta = {
  title: 'Navigation/PageNav',
  parameters: { layout: 'fullscreen' },
  args: { previous: true, next: true, longText: false },
  render: (args) => page(args),
} satisfies Meta<NavArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** The first page of the sequence: only a next, kept to the right. */
export const FirstPage: Story = {
  args: { previous: false },
}

/** The last page: only a previous. */
export const LastPage: Story = {
  args: { next: false },
}

export const LongText: Story = {
  args: { longText: true },
}

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
