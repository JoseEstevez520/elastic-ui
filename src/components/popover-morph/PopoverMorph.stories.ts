import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Archive, Copy, FolderInput, Pencil, Trash2 } from '@lucide/vue'
import { ref } from 'vue'
import Button from '../button/Button.vue'
import PopoverMorph from './PopoverMorph.vue'
import PopoverMorphItem from './PopoverMorphItem.vue'
import PopoverMorphSeparator from './PopoverMorphSeparator.vue'

const meta = {
  title: 'Special/PopoverMorph',
  // Top-aligned: centering would re-center the trigger as the panel grows.
  render: () => ({
    components: { Button, PopoverMorph },
    template: `
      <PopoverMorph label="Share">
        <template #trigger>Share</template>
        <template #default="{ close }">
          <p class="font-medium">Share this page</p>
          <p class="mt-1 text-fg-secondary">Anyone with the link can read it.</p>
          <div class="mt-3 flex justify-end gap-2">
            <Button size="sm" variant="ghost" @click="close">Cancel</Button>
            <Button size="sm" @click="close">Copy link</Button>
          </div>
        </template>
      </PopoverMorph>`,
  }),
} satisfies Meta<typeof PopoverMorph>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * A menu: the trigger's box grows into the list. Arrow keys move between the items, a letter jumps
 * to the next one starting with it, and choosing one closes the menu.
 */
export const Menu: Story = {
  render: () => ({
    components: { PopoverMorph, PopoverMorphItem, PopoverMorphSeparator },
    setup: () => ({ icons: { Archive, Copy, FolderInput, Pencil, Trash2 } }),
    template: `
      <PopoverMorph role="menu" label="Actions" class="[--popover-width:13rem]">
        <template #trigger>Actions</template>
        <PopoverMorphItem :icon="icons.Pencil" shortcut="⌘R">Rename</PopoverMorphItem>
        <PopoverMorphItem :icon="icons.Copy" shortcut="⌘D">Duplicate</PopoverMorphItem>
        <PopoverMorphItem :icon="icons.FolderInput">Move to…</PopoverMorphItem>
        <PopoverMorphSeparator />
        <PopoverMorphItem :icon="icons.Archive">Archive</PopoverMorphItem>
        <PopoverMorphItem :icon="icons.Trash2" disabled>Delete (not allowed)</PopoverMorphItem>
      </PopoverMorph>`,
  }),
}

/** Lined up with the trigger's end edge: grows to the left. */
export const AlignEnd: Story = {
  render: () => ({
    components: { PopoverMorph },
    template: `
      <div class="flex justify-end">
        <PopoverMorph align="end" label="Account">
          <template #trigger>Account</template>
          <p class="font-medium">Jane Doe</p>
          <p class="mt-1 text-fg-secondary">jane@example.com</p>
        </PopoverMorph>
      </div>`,
  }),
}

/** Opened from outside with `v-model:open`. */
export const Controlled: Story = {
  render: () => ({
    components: { Button, PopoverMorph },
    setup: () => ({ open: ref(false) }),
    template: `
      <div class="flex items-start gap-4">
        <PopoverMorph v-model:open="open" label="Details">
          <template #trigger>Details</template>
          Also opened by the button beside it.
        </PopoverMorph>
        <Button variant="ghost" @click="open = true">Open from here</Button>
      </div>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** Opens upwards, for a trigger near the bottom of the screen. */
export const SideTop: Story = {
  render: () => ({
    components: { PopoverMorph },
    template: `
      <div class="flex h-[80vh] items-end">
        <PopoverMorph side="top" label="Help">
          <template #trigger>Help</template>
          <p class="text-fg-secondary">Grows upwards from the trigger.</p>
        </PopoverMorph>
      </div>`,
  }),
}

/** Taller than the screen allows: the panel scrolls inside. */
export const LongContent: Story = {
  render: () => ({
    components: { PopoverMorph },
    template: `
      <PopoverMorph label="Notes">
        <template #trigger>Long content</template>
        <p v-for="n in 20" :key="n" class="mb-2">Paragraph {{ n }}: enough text to make the panel taller than the screen.</p>
      </PopoverMorph>`,
  }),
}

/** A label much longer than in English: the trigger's box starts at its real width. */
export const LongLabel: Story = {
  render: () => ({
    components: { PopoverMorph },
    template: `
      <PopoverMorph label="Options">
        <template #trigger>Configuración de privacidad avanzada</template>
        <p class="text-fg-secondary">Narrower than its trigger: the box shrinks and grows down at once.</p>
      </PopoverMorph>`,
  }),
}

/** Text flowing around it stays put: the trigger keeps its place while the panel floats over. */
export const InText: Story = {
  render: () => ({
    components: { PopoverMorph },
    template: `
      <div class="max-w-lg">
        <p class="mb-3 text-fg">Text above the trigger, to check that nothing around it moves when it opens.</p>
        <PopoverMorph label="Info">
          <template #trigger>Info</template>
          <p class="text-fg-secondary">Floats over the paragraph below.</p>
        </PopoverMorph>
        <p class="mt-3 text-fg">Text below the trigger. The panel covers it instead of pushing it down.</p>
      </div>`,
  }),
}

export const TwoInstances: Story = {
  render: () => ({
    components: { PopoverMorph },
    template: `
      <div class="flex gap-4">
        <PopoverMorph v-for="name in ['First', 'Second']" :key="name" :label="name">
          <template #trigger>{{ name }}</template>
          The {{ name.toLowerCase() }} one. Opening the other closes this one.
        </PopoverMorph>
      </div>`,
  }),
}
