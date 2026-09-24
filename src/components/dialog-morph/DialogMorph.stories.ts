import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Button from '../button/Button.vue'
import DialogMorph from './DialogMorph.vue'
import DialogMorphClose from './DialogMorphClose.vue'
import DialogMorphDescription from './DialogMorphDescription.vue'
import DialogMorphTitle from './DialogMorphTitle.vue'

const parts = { Button, DialogMorph, DialogMorphTitle, DialogMorphDescription, DialogMorphClose }

const meta = {
  title: 'Special/DialogMorph',
  render: () => ({
    components: parts,
    template: `
      <DialogMorph>
        <template #trigger>Delete project</template>
        <DialogMorphTitle>Delete this project?</DialogMorphTitle>
        <DialogMorphDescription>Its pages, files and history go with it. This cannot be undone.</DialogMorphDescription>
        <div class="mt-6 flex justify-end gap-2">
          <DialogMorphClose as-child><Button variant="ghost">Cancel</Button></DialogMorphClose>
          <DialogMorphClose as-child><Button>Delete</Button></DialogMorphClose>
        </div>
      </DialogMorph>`,
  }),
} satisfies Meta<typeof DialogMorph>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** A form: focus moves to the first field and stays inside until the dialog closes. */
export const Form: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ name: ref('') }),
    template: `
      <DialogMorph>
        <template #trigger>Rename</template>
        <template #default="{ close }">
          <DialogMorphTitle>Rename project</DialogMorphTitle>
          <DialogMorphDescription>Shown in the sidebar and in shared links.</DialogMorphDescription>
          <form class="mt-5 flex flex-col gap-4" @submit.prevent="close">
            <input
              v-model="name"
              placeholder="Project name"
              class="h-10 rounded-md border border-border-strong bg-transparent px-3 text-sm text-fg outline-none focus-visible:outline-2 focus-visible:outline-accent"
            />
            <div class="flex justify-end gap-2">
              <Button variant="ghost" @click="close">Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </template>
      </DialogMorph>`,
  }),
}

/** Opened from outside with `v-model:open`. */
export const Controlled: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ open: ref(false) }),
    template: `
      <div class="flex items-center gap-4">
        <DialogMorph v-model:open="open">
          <template #trigger>Details</template>
          <DialogMorphTitle>Details</DialogMorphTitle>
          <DialogMorphDescription>Also opened by the button beside it.</DialogMorphDescription>
        </DialogMorph>
        <Button variant="ghost" @click="open = true">Open from here</Button>
      </div>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** Taller than the screen: the dialog scrolls inside, the page behind stays put. */
export const LongContent: Story = {
  render: () => ({
    components: parts,
    template: `
      <DialogMorph>
        <template #trigger>Terms</template>
        <DialogMorphTitle>Terms of use</DialogMorphTitle>
        <p v-for="n in 20" :key="n" class="mt-3 text-sm text-fg-secondary">Clause {{ n }}: enough text to make the dialog taller than the screen, to check that it scrolls inside.</p>
      </DialogMorph>`,
  }),
}

/** In a corner, far from the middle: the box travels the whole way. */
export const FromCorner: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: parts,
    template: `
      <div class="flex h-screen items-end justify-end p-4">
        <DialogMorph>
          <template #trigger>Feedback</template>
          <DialogMorphTitle>Send feedback</DialogMorphTitle>
          <DialogMorphDescription>Travels in from the corner and back to it.</DialogMorphDescription>
        </DialogMorph>
      </div>`,
  }),
}

/** Text flowing around the button stays put while the dialog is out. */
export const InText: Story = {
  render: () => ({
    components: parts,
    template: `
      <p class="max-w-md text-fg">
        Text before the button,
        <DialogMorph>
          <template #trigger>Open</template>
          <DialogMorphTitle>Inline</DialogMorphTitle>
          <DialogMorphDescription>The button's place is held while its box is out.</DialogMorphDescription>
        </DialogMorph>
        and text after it, which never moves.
      </p>`,
  }),
}

export const TwoInstances: Story = {
  render: () => ({
    components: parts,
    template: `
      <div class="flex gap-4">
        <DialogMorph v-for="name in ['First', 'Second']" :key="name">
          <template #trigger>{{ name }}</template>
          <DialogMorphTitle>{{ name }}</DialogMorphTitle>
          <DialogMorphDescription>Returns to its own button.</DialogMorphDescription>
        </DialogMorph>
      </div>`,
  }),
}
