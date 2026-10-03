import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { onBeforeUnmount, ref } from 'vue'
import Button from '../button/Button.vue'
import Status from './Status.vue'

const meta = {
  title: 'Content/Status',
  component: Status,
  parameters: { layout: 'centered' },
  args: { state: 'done' },
  argTypes: { state: { control: 'select', options: ['idle', 'working', 'done', 'discarded', 'flagged', 'error'] } },
} satisfies Meta<typeof Status>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

const all = ['idle', 'working', 'done', 'discarded', 'flagged', 'error'] as const

/** Every state. Only an outcome has a colour; discarded is grey, not the danger colour. */
export const States: Story = {
  render: () => ({
    components: { Status },
    setup: () => ({ all }),
    template: `<div class="flex flex-col gap-3"><Status v-for="s in all" :key="s" :state="s" /></div>`,
  }),
}

/** A state that changes while you watch turns into the next one. */
export const Changing: Story = {
  render: () => ({
    components: { Status, Button },
    setup() {
      const i = ref(0)
      return { all, i, next: () => (i.value = (i.value + 1) % all.length) }
    },
    template: `
      <div class="flex flex-col items-center gap-6">
        <Status :state="all[i]" />
        <Button variant="ghost" @click="next">Next state</Button>
      </div>`,
  }),
}

/** A run that goes by itself: pending, working, then done. */
export const Run: Story = {
  render: () => ({
    components: { Status },
    setup() {
      const s = ref<(typeof all)[number]>('idle')
      const steps = ['idle', 'working', 'done'] as const
      let n = 0
      const timer = setInterval(() => (s.value = steps[++n % steps.length]), 1800)
      onBeforeUnmount(() => clearInterval(timer))
      return { s }
    },
    template: `<Status :state="s" />`,
  }),
}

/** In a list, as notes are shown; the reason is on hover and focus. */
export const InAList: Story = {
  render: () => ({
    components: { Status },
    template: `
      <ul class="w-96 divide-y divide-border">
        <li class="flex items-center justify-between py-2.5"><span class="text-label text-fg">Servlets and filters</span><Status state="done" /></li>
        <li class="flex items-center justify-between py-2.5"><span class="text-label text-fg">ok</span><Status state="discarded" reason="Just a filler, nothing to add" /></li>
        <li class="flex items-center justify-between py-2.5"><span class="text-label text-fg">Maven lifecycle</span><Status state="working" /></li>
        <li class="flex items-center justify-between py-2.5"><span class="text-label text-fg">Photos of the board</span><Status state="flagged" reason="Photos cannot be read yet" /></li>
        <li class="flex items-center justify-between py-2.5"><span class="text-label text-fg">Docker setup</span><Status state="error" reason="The model did not answer" /></li>
        <li class="flex items-center justify-between py-2.5"><span class="text-label text-fg">Waiting for the next pass</span><Status state="idle" /></li>
      </ul>`,
  }),
}

/** Situation, one: a single status on its own, and the app's own words in its own language. */
export const OwnWords: Story = {
  render: () => ({
    components: { Status },
    template: `<div class="flex flex-col gap-3"><Status state="done" label="Procesada" /><Status state="discarded" label="Descartada" reason="Es solo un saludo, no aporta nada" /><Status state="error" label="Fallida" /></div>`,
  }),
}

/** Situation, a label much longer than its box: it ends in a fading edge, never an ellipsis. */
export const LongLabel: Story = {
  render: () => ({
    components: { Status },
    template: `<div class="w-40"><Status state="flagged" label="Needs a look from whoever reviews the notes this week" /></div>`,
  }),
}

/** Situation, two instances side by side, changing on their own: each keeps to itself. */
export const Two: Story = {
  render: () => ({
    components: { Status, Button },
    setup() {
      const a = ref<(typeof all)[number]>('idle')
      const b = ref<(typeof all)[number]>('working')
      return { a, b, flip: () => ([a.value, b.value] = [b.value, a.value]) }
    },
    template: `<div class="flex flex-col items-center gap-4"><div class="flex gap-10"><Status :state="a" /><Status :state="b" /></div><Button variant="ghost" @click="flip">Swap</Button></div>`,
  }),
}
