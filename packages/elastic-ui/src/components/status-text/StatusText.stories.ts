import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { onBeforeUnmount, ref } from 'vue'
import Button from '../button/Button.vue'
import StatusText from './StatusText.vue'

const meta = {
  title: 'Text/StatusText',
  component: StatusText,
  args: { text: 'Searching the web…', working: true },
} satisfies Meta<typeof StatusText>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Work going on: each step morphs from the last, and the end turns into what came of it. */
export const Steps: Story = {
  render: () => ({
    components: { Button, StatusText },
    setup() {
      const lines = ['Reading the notes…', 'Looking for examples…', 'Writing the answer…', 'Found 3 examples']
      const step = ref(0)
      let timer: ReturnType<typeof setInterval> | undefined
      function run() {
        clearInterval(timer)
        step.value = 0
        timer = setInterval(() => step.value < lines.length - 1 ? step.value++ : clearInterval(timer), 1400)
      }
      run()
      onBeforeUnmount(() => clearInterval(timer))
      return { lines, step, run }
    },
    template: `
      <div class="flex flex-col items-start gap-4 text-sm">
        <StatusText :text="lines[step]" :working="step < lines.length - 1" :class="step === lines.length - 1 && 'text-fg-muted'" />
        <Button size="sm" variant="outline" @click="run">Again</Button>
      </div>`,
  }),
}

/**
 * A wait that is often short: nothing shows for the first 300 ms, so a quick answer never flashes
 * "Loading…". Pick a wait to see both: under the delay it never appears.
 */
export const Delayed: Story = {
  render: () => ({
    components: { Button, StatusText },
    setup() {
      const loading = ref(false)
      let timer: ReturnType<typeof setTimeout> | undefined
      function wait(ms: number) {
        clearTimeout(timer)
        loading.value = true
        timer = setTimeout(() => (loading.value = false), ms)
      }
      onBeforeUnmount(() => clearTimeout(timer))
      return { loading, wait }
    },
    template: `
      <div class="flex flex-col items-start gap-4 text-sm">
        <div class="h-5">
          <StatusText v-if="loading" text="Loading the page…" working :delay="300" />
          <span v-else class="text-fg-secondary">Ready.</span>
        </div>
        <div class="flex gap-2">
          <Button size="sm" variant="outline" @click="wait(150)">Wait 150 ms</Button>
          <Button size="sm" variant="outline" @click="wait(1500)">Wait 1.5 s</Button>
        </div>
      </div>`,
  }),
}

/** It fails: the words morph into what went wrong as the line turns to the danger colour. */
export const Error: Story = {
  render: () => ({
    components: { Button, StatusText },
    setup() {
      const failed = ref(false)
      let timer: ReturnType<typeof setTimeout> | undefined
      function run() {
        clearTimeout(timer)
        failed.value = false
        timer = setTimeout(() => (failed.value = true), 1800)
      }
      run()
      onBeforeUnmount(() => clearTimeout(timer))
      return { failed, run }
    },
    template: `
      <div class="flex flex-col items-start gap-4 text-sm">
        <StatusText :text="failed ? 'Couldn\\'t reach the server' : 'Searching the web…'" :working="!failed" :error="failed" />
        <Button size="sm" variant="outline" @click="run">Again</Button>
      </div>`,
  }),
}
