import { Bell, FileText, House, LogOut, Moon, Plus, Settings, User, Users } from '@lucide/vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Button from '../button/Button.vue'
import CommandEmpty from './CommandEmpty.vue'
import CommandGroup from './CommandGroup.vue'
import CommandInput from './CommandInput.vue'
import CommandItem from './CommandItem.vue'
import CommandList from './CommandList.vue'
import CommandPalette from './CommandPalette.vue'

const parts = { Button, CommandPalette, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty }
const icons = { House, FileText, Users, Settings, User, Bell, Moon, Plus, LogOut }

const commands = `
  <CommandInput />
  <CommandList>
    <CommandEmpty />
    <CommandGroup heading="Pages">
      <CommandItem value="home" :icon="icons.House" @select="chosen = 'Home'">Home</CommandItem>
      <CommandItem value="docs" :icon="icons.FileText" :keywords="['guide', 'help']" @select="chosen = 'Documentation'">Documentation</CommandItem>
      <CommandItem value="team" :icon="icons.Users" @select="chosen = 'Team'">Team</CommandItem>
    </CommandGroup>
    <CommandGroup heading="Settings">
      <CommandItem value="profile" :icon="icons.User" shortcut="⌘P" @select="chosen = 'Profile'">Profile</CommandItem>
      <CommandItem value="notifications" :icon="icons.Bell" :keywords="['alerts', 'email']" @select="chosen = 'Notifications'">Notifications</CommandItem>
      <CommandItem value="theme" :icon="icons.Moon" :keywords="['dark', 'light']" shortcut="⌘D" @select="chosen = 'Theme'">Switch theme</CommandItem>
      <CommandItem value="preferences" :icon="icons.Settings" shortcut="⌘," @select="chosen = 'Preferences'">Preferences</CommandItem>
    </CommandGroup>
    <CommandGroup heading="Actions">
      <CommandItem value="new-project" :icon="icons.Plus" shortcut="⌘N" @select="chosen = 'New project'">New project</CommandItem>
      <CommandItem value="sign-out" :icon="icons.LogOut" @select="chosen = 'Sign out'">Sign out</CommandItem>
    </CommandGroup>
  </CommandList>`

const withChoice = (template: string) => ({
  components: parts,
  setup: () => ({ icons, chosen: ref('') }),
  template: `
    <div class="flex flex-col items-start gap-4">
      ${template}
      <p class="text-sm text-fg-muted">Chosen: {{ chosen || '—' }}</p>
    </div>`,
})

const meta = {
  title: 'Overlays/CommandPalette',
  render: () => withChoice(`<CommandPalette>${commands}</CommandPalette>`),
} satisfies Meta<typeof CommandPalette>

export default meta
type Story = StoryObj<typeof meta>

/** Click the button and it grows into the palette. */
export const Default: Story = {}

/** No button, only a shortcut (off unless set): there is nothing to grow from, so it appears. */
export const ShortcutOnly: Story = {
  render: () =>
    withChoice(`
      <p class="text-sm text-fg">Press <kbd>⌘K</kbd> / <kbd>Ctrl K</kbd>.</p>
      <CommandPalette :trigger="false" shortcut="mod+k">${commands}</CommandPalette>`),
}

/** Opened from outside with `v-model:open`: nothing to grow from, so it appears. */
export const Controlled: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ icons, chosen: ref(''), open: ref(false) }),
    template: `
      <div class="flex flex-col items-start gap-4">
        <div class="flex items-center gap-4">
          <CommandPalette v-model:open="open">${commands}</CommandPalette>
          <Button variant="ghost" @click="open = true">Open from here</Button>
        </div>
        <p class="text-sm text-fg-muted">Chosen: {{ chosen || '—' }}</p>
      </div>`,
  }),
}

/** A handler that calls `preventDefault()` keeps the palette open, to chain several commands. */
export const StayOpen: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ count: ref(0), add: (event: Event) => event.preventDefault() }),
    template: `
      <div class="flex flex-col items-start gap-4">
        <CommandPalette>
          <CommandInput />
          <CommandList>
            <CommandItem value="add" @select="(e) => { add(e); count++ }">Add one</CommandItem>
            <CommandItem value="reset" @select="(e) => { add(e); count = 0 }">Reset</CommandItem>
            <CommandItem value="done">Done</CommandItem>
          </CommandList>
        </CommandPalette>
        <p class="text-sm text-fg-muted">Count: {{ count }}</p>
      </div>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** One command: the palette still has its height, no group heading. */
export const One: Story = {
  render: () =>
    withChoice(`
      <CommandPalette>
        <CommandInput />
        <CommandList>
          <CommandEmpty />
          <CommandItem value="home" @select="chosen = 'Home'">Home</CommandItem>
        </CommandList>
      </CommandPalette>`),
}

/** Many commands: the list scrolls inside, the field stays put, and filtering eases its height. */
export const Many: Story = {
  render: () => ({
    components: parts,
    setup: () => ({
      chosen: ref(''),
      pages: Array.from({ length: 60 }, (_, index) => `Page ${index + 1}`),
    }),
    template: `
      <div class="flex flex-col items-start gap-4">
        <CommandPalette>
          <CommandInput />
          <CommandList>
            <CommandEmpty />
            <CommandGroup heading="Pages">
              <CommandItem v-for="page in pages" :key="page" :value="page" @select="chosen = page">{{ page }}</CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandPalette>
        <p class="text-sm text-fg-muted">Chosen: {{ chosen || '—' }}</p>
      </div>`,
  }),
}

/** Nothing to show: an empty palette is only its field and the message. */
export const Empty: Story = {
  render: () =>
    withChoice(`
      <CommandPalette>
        <CommandInput />
        <CommandList>
          <CommandEmpty>Nothing here yet.</CommandEmpty>
        </CommandList>
      </CommandPalette>`),
}

/** Long labels end in a fading edge, the shortcut keeps its place. */
export const LongText: Story = {
  render: () =>
    withChoice(`
      <CommandPalette>
        <CommandInput />
        <CommandList>
          <CommandGroup heading="A heading long enough to reach the edge of the palette on a phone">
            <CommandItem value="long" :icon="icons.FileText" shortcut="⌘L" @select="chosen = 'Long'">
              Quarterly planning notes for the design system team, with the decisions from every review
            </CommandItem>
            <CommandItem value="short" :icon="icons.House" @select="chosen = 'Short'">Home</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandPalette>`),
}

/**
 * Accents and synonyms: "cafe" finds "Café", "ajustes" finds Settings, and the words of a query
 * can come in any order ("theme switch").
 */
export const Languages: Story = {
  render: () =>
    withChoice(`
      <CommandPalette label="Buscar">
        <CommandInput placeholder="Escribe un comando o busca…" />
        <CommandList>
          <CommandEmpty>Sin resultados</CommandEmpty>
          <CommandGroup heading="Páginas">
            <CommandItem value="cafe" :icon="icons.House" @select="chosen = 'Café'">Café</CommandItem>
            <CommandItem value="settings" :icon="icons.Settings" :keywords="['ajustes', 'preferencias']" @select="chosen = 'Settings'">Settings</CommandItem>
            <CommandItem value="theme" :icon="icons.Moon" @select="chosen = 'Switch theme'">Switch theme</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandPalette>`),
}

/** Two palettes: each has its own button; the shortcut belongs to the first. */
export const TwoOnAPage: Story = {
  render: () =>
    withChoice(`
      <div class="flex gap-4">
        <CommandPalette label="Commands" shortcut="mod+k">${commands}</CommandPalette>
        <CommandPalette label="Pages">
          <CommandInput />
          <CommandList>
            <CommandEmpty />
            <CommandItem value="home" @select="chosen = 'Home (second)'">Home</CommandItem>
            <CommandItem value="docs" @select="chosen = 'Docs (second)'">Documentation</CommandItem>
          </CommandList>
        </CommandPalette>
      </div>`),
}
