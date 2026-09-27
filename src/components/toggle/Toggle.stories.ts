import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Bold, Italic, LayoutGrid, LayoutList, List, Rows3, Underline } from '@lucide/vue'
import { ref } from 'vue'
import Toggle from './Toggle.vue'
import ToggleGroup from './ToggleGroup.vue'
import ToggleGroupItem from './ToggleGroupItem.vue'

const meta = { title: 'Actions/Toggle', component: Toggle, parameters: { layout: 'centered' } } satisfies Meta<
  typeof Toggle
>
export default meta
type Story = StoryObj<typeof meta>

/** Pressed, it stands on the raised tone; its play turns into pause (IconMorph). */
export const PlayPause: Story = {
  render: () => ({
    components: { Toggle },
    setup: () => ({ playing: ref(false) }),
    template: `<Toggle v-model="playing" icon="play" pressed-icon="pause" :aria-label="playing ? 'Pause' : 'Play'" />`,
  }),
}

/** Text formatting: each pressed on its own, each a raised part on the group's tray. */
export const Formatting: Story = {
  render: () => ({
    components: { ToggleGroup, ToggleGroupItem, Bold, Italic, Underline, List },
    setup: () => ({ marks: ref(['bold']) }),
    template: `
      <ToggleGroup v-model="marks" type="multiple" aria-label="Text formatting">
        <ToggleGroupItem value="bold" aria-label="Bold"><Bold class="size-4" /></ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic"><Italic class="size-4" /></ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline"><Underline class="size-4" /></ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="List"><List class="size-4" /></ToggleGroupItem>
      </ToggleGroup>`,
  }),
}

/** A choice of view: one at a time, the raised part sliding to the one chosen. */
export const ViewMode: Story = {
  render: () => ({
    components: { ToggleGroup, ToggleGroupItem, LayoutList, LayoutGrid, Rows3 },
    setup: () => ({ view: ref('list') }),
    template: `
      <ToggleGroup v-model="view" type="single" aria-label="View">
        <ToggleGroupItem value="list" aria-label="List"><LayoutList class="size-4" /></ToggleGroupItem>
        <ToggleGroupItem value="grid" aria-label="Grid"><LayoutGrid class="size-4" /></ToggleGroupItem>
        <ToggleGroupItem value="compact" aria-label="Compact"><Rows3 class="size-4" /></ToggleGroupItem>
      </ToggleGroup>`,
  }),
}

/** With words, where an icon alone would not say it. */
export const WithText: Story = {
  render: () => ({
    components: { ToggleGroup, ToggleGroupItem },
    setup: () => ({ range: ref('week') }),
    template: `
      <ToggleGroup v-model="range" type="single" size="sm" aria-label="Range">
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
        <ToggleGroupItem value="month">Month</ToggleGroupItem>
      </ToggleGroup>`,
  }),
}

/** On their own, in a toolbar: no surface until hovered or pressed. */
export const Alone: Story = {
  render: () => ({
    components: { Toggle, Bold, Italic },
    setup: () => ({ bold: ref(true), italic: ref(false) }),
    template: `
      <div class="flex gap-1">
        <Toggle v-model="bold" aria-label="Bold"><Bold class="size-4" /></Toggle>
        <Toggle v-model="italic" aria-label="Italic"><Italic class="size-4" /></Toggle>
        <Toggle disabled aria-label="Underline (unavailable)"><Bold class="size-4" /></Toggle>
      </div>`,
  }),
}
