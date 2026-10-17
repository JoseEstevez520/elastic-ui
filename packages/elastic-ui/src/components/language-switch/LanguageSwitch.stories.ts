import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { h, ref, type FunctionalComponent } from 'vue'
import ThemeToggle from '../theme-toggle/ThemeToggle.vue'
import LanguageSwitch from './LanguageSwitch.vue'

// Flags are the project's own, as icons are: drawn here only for the stories.
const flag =
  (colours: [string, string]): FunctionalComponent =>
  () =>
    h('svg', { viewBox: '0 0 24 16', class: 'h-3.5 w-5 shrink-0 rounded-[3px]' }, [
      h('rect', { width: 24, height: 16, fill: colours[1] }),
      h('rect', { width: 12, height: 16, fill: colours[0] }),
    ])

const languages = [
  { code: 'es', label: 'Español', icon: flag(['#c60b1e', '#ffc400']) },
  { code: 'en', label: 'English', icon: flag(['#012169', '#c8102e']) },
  { code: 'gl', label: 'Galego', icon: flag(['#ffffff', '#0b5fa5']) },
]

const meta = {
  title: 'Navigation/LanguageSwitch',
  component: LanguageSwitch,
  parameters: { layout: 'padded' },
  args: { languages },
} satisfies Meta<typeof LanguageSwitch>
export default meta
type Story = StoryObj<typeof meta>

/** An icon that unfolds into the languages, each named in its own words, the one in use marked. */
export const Default: Story = {
  render: () => ({
    components: { LanguageSwitch },
    setup: () => ({ languages, lang: ref('es') }),
    template: `<div class="flex justify-end"><LanguageSwitch v-model="lang" :languages="languages" /></div>`,
  }),
}

/** Only the marks, as in a header with two languages: the names stay for screen readers and the tooltip. */
export const MarksOnly: Story = {
  render: () => ({
    components: { LanguageSwitch, ThemeToggle },
    setup: () => ({ languages: languages.slice(0, 2), lang: ref('es') }),
    template: `<div class="flex items-center justify-end gap-1"><LanguageSwitch v-model="lang" :languages="languages" labels="hidden" /><ThemeToggle /></div>`,
  }),
}

/** No flags at all: names alone, which is the safest for readers who cannot tell a flag from a language. */
export const NamesOnly: Story = {
  render: () => ({
    components: { LanguageSwitch },
    setup: () => ({ languages: languages.map(({ code, label }) => ({ code, label })), lang: ref('en') }),
    template: `<div class="flex justify-end"><LanguageSwitch v-model="lang" :languages="languages" /></div>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** A value that is not in the list: the trigger is named by the menu's own label. */
export const UnknownValue: Story = {
  render: () => ({
    components: { LanguageSwitch },
    setup: () => ({ languages, lang: ref('fr') }),
    template: `<div class="flex justify-end"><LanguageSwitch v-model="lang" :languages="languages" /></div>`,
  }),
}

/** Opened near the left edge of the screen, with the panel kept inside it. */
export const AtTheStart: Story = {
  render: () => ({
    components: { LanguageSwitch },
    setup: () => ({ languages, lang: ref('es') }),
    template: `<div><LanguageSwitch v-model="lang" :languages="languages" align="start" /></div>`,
  }),
}
