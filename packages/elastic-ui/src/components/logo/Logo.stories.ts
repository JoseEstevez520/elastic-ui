import type { Meta, StoryObj } from '@storybook/vue3-vite'
import {
  siDocker,
  siGithub,
  siGradle,
  siJavascript,
  siNodedotjs,
  siPostgresql,
  siPython,
  siSpringboot,
  siTailwindcss,
  siVuedotjs,
} from 'simple-icons'
import Logo from './Logo.vue'
import LogoList from './LogoList.vue'
import LogoListItem from './LogoListItem.vue'

// The library ships no icons: Simple Icons stands in for a project's brand logos, passed in as data.
const STACK = [siSpringboot, siVuedotjs, siTailwindcss, siPostgresql, siDocker, siGithub]
// A brand Simple Icons lacks, as a one-colour image of its own (here a data URL, as from your site).
const OWN_MARK = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="#fff"/></svg>')}`

const meta = {
  title: 'Content/Logo',
  component: Logo,
  args: { icon: siVuedotjs },
  argTypes: { icon: { control: false }, mono: { control: 'boolean' } },
  render: (args) => ({
    components: { Logo },
    setup: () => ({ args }),
    template: `<Logo v-bind="args" class="size-8" />`,
  }),
} satisfies Meta<typeof Logo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** A stack named by its logos, each with its name: the way to list technologies without a paragraph. */
export const Stack: Story = {
  render: () => ({
    components: { LogoList, LogoListItem },
    setup: () => ({ stack: STACK }),
    template: `
      <LogoList class="max-w-md">
        <LogoListItem v-for="icon in stack" :key="icon.slug" :icon="icon">{{ icon.title }}</LogoListItem>
      </LogoList>`,
  }),
}

/**
 * In their own colours where those read, in the text's where they do not: JavaScript's yellow on
 * the light ground, GitHub's and Gradle's near-black on the dark one. Switch the theme to compare.
 */
export const Colours: Story = {
  render: () => ({
    components: { Logo },
    setup: () => ({ icons: [siJavascript, siPython, siNodedotjs, siGithub, siGradle, siTailwindcss] }),
    template: `
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-4"><Logo v-for="icon in icons" :key="icon.slug" :icon="icon" class="size-8" /></div>
        <div class="flex items-center gap-4"><Logo v-for="icon in icons" :key="icon.slug" :icon="icon" mono class="size-8" /></div>
      </div>`,
  }),
}

/** No trays, for a list over colour (a Glow) or set in a line of text. */
export const Bare: Story = {
  render: () => ({
    components: { LogoList, LogoListItem },
    setup: () => ({ stack: STACK }),
    template: `
      <LogoList bare class="max-w-md">
        <LogoListItem v-for="icon in stack" :key="icon.slug" :icon="icon">{{ icon.title }}</LogoListItem>
      </LogoList>`,
  }),
}

/** In the text's colour throughout, for a quieter row. */
export const Mono: Story = {
  render: () => ({
    components: { LogoList, LogoListItem },
    setup: () => ({ stack: STACK }),
    template: `
      <LogoList class="max-w-md">
        <LogoListItem v-for="icon in stack" :key="icon.slug" :icon="icon" mono>{{ icon.title }}</LogoListItem>
      </LogoList>`,
  }),
}

/** A brand that is not in Simple Icons, from an image of its own; `mono` draws a one-colour one in the text's colour. */
export const OwnImage: Story = {
  render: () => ({
    components: { LogoList, LogoListItem },
    setup: () => ({ mark: OWN_MARK, vue: siVuedotjs }),
    template: `
      <LogoList>
        <LogoListItem :icon="vue">Vue</LogoListItem>
        <LogoListItem :src="mark" mono>Our own tool</LogoListItem>
      </LogoList>`,
  }),
}

/** Many, and a long name: the row wraps onto more lines. */
export const Many: Story = {
  render: () => ({
    components: { LogoList, LogoListItem },
    setup: () => ({ stack: [...STACK, siJavascript, siPython, siNodedotjs, siGradle] }),
    template: `
      <LogoList class="max-w-sm">
        <LogoListItem v-for="icon in stack" :key="icon.slug" :icon="icon">{{ icon.title }}</LogoListItem>
        <LogoListItem>A tool with a much longer name and no logo</LogoListItem>
      </LogoList>`,
  }),
}
