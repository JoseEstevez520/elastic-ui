import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ThemeToggle } from '../theme-toggle'
import MorphHeader from './MorphHeader.vue'
import MorphHeaderLink from './MorphHeaderLink.vue'
import MorphHeaderNav from './MorphHeaderNav.vue'

const meta = {
  title: 'Special/MorphHeader',
  component: MorphHeader,
  parameters: { layout: 'fullscreen' },
  args: { scrollThreshold: 40, menu: 'responsive' },
  argTypes: {
    menu: { control: 'inline-radio', options: ['responsive', 'always'] },
  },
  render: (args) => ({
    components: { MorphHeader, MorphHeaderNav, MorphHeaderLink, ThemeToggle },
    setup: () => ({ args }),
    template: `
      <MorphHeader v-bind="args">
        <template #logo>
          <span class="font-semibold tracking-tight">elastic</span>
        </template>

        <MorphHeaderNav>
          <MorphHeaderLink href="#projects">Projects</MorphHeaderLink>
          <MorphHeaderLink href="#about">About</MorphHeaderLink>
          <MorphHeaderLink href="#background">Background</MorphHeaderLink>
          <MorphHeaderLink href="#skills">Skills</MorphHeaderLink>
          <MorphHeaderLink href="#contact">Contact</MorphHeaderLink>
        </MorphHeaderNav>

        <template #actions>
          <ThemeToggle />
        </template>
      </MorphHeader>

      <main class="mx-auto flex w-[86%] flex-col sm:w-[60%] gap-6 px-4 pt-40 pb-20 text-fg-secondary">
        <p class="text-2xl font-semibold text-fg">Scroll down to see the bar turn into a pill.</p>
        <p>Narrow the viewport below 64rem to get the menu button; opening it grows the pill into a panel.</p>
        <p v-for="n in 30" :key="n">Paragraph {{ n }} of filler content so the page can scroll.</p>
      </main>`,
  }),
} satisfies Meta<typeof MorphHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Only the logo and the menu button, at every width. */
export const MenuOnly: Story = {
  args: { menu: 'always' },
}
