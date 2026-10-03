import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Button from '../button/Button.vue'
import Popover from './Popover.vue'
import PopoverClose from './PopoverClose.vue'
import PopoverContent from './PopoverContent.vue'
import PopoverTrigger from './PopoverTrigger.vue'

const parts = { Button, Popover, PopoverTrigger, PopoverContent, PopoverClose }

const meta = {
  title: 'Overlays/Popover',
  render: () => ({
    components: parts,
    template: `
      <Popover>
        <PopoverTrigger as-child><Button variant="outline">What is a harness?</Button></PopoverTrigger>
        <PopoverContent>
          <p class="font-medium">The model's body</p>
          <p class="mt-1 text-fg-secondary">It reads your project, edits files and runs commands, then shows the model what happened.</p>
        </PopoverContent>
      </Popover>`,
  }),
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Aligned to the trigger's start edge: the panel appears from the corner under it. */
export const AlignStart: Story = {
  render: () => ({
    components: parts,
    template: `
      <Popover>
        <PopoverTrigger as-child><Button variant="ghost">Options</Button></PopoverTrigger>
        <PopoverContent align="start" class="[--popover-width:14rem]">
          <p class="text-fg-secondary">Appears from the trigger's left edge.</p>
        </PopoverContent>
      </Popover>`,
  }),
}

export const WithClose: Story = {
  render: () => ({
    components: parts,
    template: `
      <Popover>
        <PopoverTrigger as-child><Button>Share</Button></PopoverTrigger>
        <PopoverContent>
          <p class="font-medium">Share this page</p>
          <p class="mt-1 text-fg-secondary">Anyone with the link can read it.</p>
          <div class="mt-3 flex justify-end">
            <PopoverClose as-child><Button size="sm" variant="outline">Done</Button></PopoverClose>
          </div>
        </PopoverContent>
      </Popover>`,
  }),
}

/** Opened from outside with `v-model:open`. */
export const Controlled: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ open: ref(false) }),
    template: `
      <div class="flex items-center gap-4">
        <Popover v-model:open="open">
          <PopoverTrigger as-child><Button variant="outline">Trigger</Button></PopoverTrigger>
          <PopoverContent>Also opened by the button beside it.</PopoverContent>
        </Popover>
        <Button variant="ghost" @click="open = true">Open from here</Button>
      </div>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** Each side appears from the edge facing its trigger. */
export const Sides: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ sides: ['top', 'right', 'bottom', 'left'] }),
    template: `
      <div class="grid grid-cols-2 gap-x-48 gap-y-32 p-32">
        <Popover v-for="side in sides" :key="side">
          <PopoverTrigger as-child><Button variant="outline">{{ side }}</Button></PopoverTrigger>
          <PopoverContent :side="side" class="[--popover-width:12rem]">Opens to the {{ side }}.</PopoverContent>
        </Popover>
      </div>`,
  }),
}

/** A trigger wider than the panel. */
export const WideTrigger: Story = {
  render: () => ({
    components: parts,
    template: `
      <Popover>
        <PopoverTrigger as-child><Button variant="outline" class="w-96">A very wide trigger</Button></PopoverTrigger>
        <PopoverContent class="[--popover-width:12rem]">Narrower than its trigger.</PopoverContent>
      </Popover>`,
  }),
}

/** Taller than the space left: the panel scrolls inside instead of leaving the screen. */
export const LongContent: Story = {
  render: () => ({
    components: parts,
    template: `
      <Popover>
        <PopoverTrigger as-child><Button variant="outline">Long content</Button></PopoverTrigger>
        <PopoverContent>
          <p v-for="n in 20" :key="n" class="mb-2">Paragraph {{ n }}: enough text to make the panel taller than the screen.</p>
        </PopoverContent>
      </Popover>`,
  }),
}

/** Near the screen's edge the panel flips or shifts to stay 16px inside it. */
export const NearEdge: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: parts,
    template: `
      <div class="flex h-screen items-end justify-end p-2">
        <Popover>
          <PopoverTrigger as-child><Button variant="outline">Corner</Button></PopoverTrigger>
          <PopoverContent>Flipped above and shifted left to fit.</PopoverContent>
        </Popover>
      </div>`,
  }),
}

export const TwoInstances: Story = {
  render: () => ({
    components: parts,
    template: `
      <div class="flex gap-4">
        <Popover v-for="name in ['First', 'Second']" :key="name">
          <PopoverTrigger as-child><Button variant="outline">{{ name }}</Button></PopoverTrigger>
          <PopoverContent>The {{ name.toLowerCase() }} popover. Opening the other closes this one.</PopoverContent>
        </Popover>
      </div>`,
  }),
}

/**
 * On a phone, `fluid` fills the screen's width, less the margin kept off its edges, so the panel
 * does not float beside a sliver of page. Wider screens keep `--popover-width`.
 */
export const PhoneWidth: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: () => ({
    components: parts,
    template: `
      <div class="flex justify-end">
        <Popover>
          <PopoverTrigger as-child><Button variant="ghost" size="sm">Options</Button></PopoverTrigger>
          <PopoverContent align="end" fluid>
            <p class="font-medium">The whole width</p>
            <p class="mt-1 text-fg-secondary">Filled on a phone, with the usual margin on both sides.</p>
          </PopoverContent>
        </Popover>
      </div>`,
  }),
}
