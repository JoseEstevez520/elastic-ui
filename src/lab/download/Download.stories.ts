import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { onBeforeUnmount, ref } from 'vue'
import DownloadButton from './DownloadButton.vue'

/**
 * Lab: completion told by the object itself. A download whose icon is its progress: the arrow's
 * stem shortens as it comes in, then the arrow drops into the tray and the tray fills a tone.
 */
const meta = { title: 'Lab/Download', parameters: { layout: 'centered' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function simulate(fail = false) {
  const state = ref<'idle' | 'working' | 'done' | 'error'>('idle')
  const progress = ref(0)
  let timer: ReturnType<typeof setInterval> | undefined
  function start() {
    progress.value = 0
    state.value = 'working'
    timer = setInterval(() => {
      progress.value = Math.min(100, progress.value + 8 + Math.random() * 14)
      if (fail && progress.value > 55) return end('error')
      if (progress.value >= 100) end('done')
    }, 350)
  }
  function end(to: 'done' | 'error') {
    clearInterval(timer)
    state.value = to
  }
  onBeforeUnmount(() => clearInterval(timer))
  return { state, progress, start }
}

/** Press it: the stem shortens as the file comes in, then the arrow drops into the tray. */
export const Default: Story = {
  render: () => ({
    components: { DownloadButton },
    setup: () => simulate(),
    template: `<DownloadButton v-model:state="state" :progress="progress" @click="start" />`,
  }),
}

/** Halfway it fails: the stem grows back and nothing lands. */
export const Failing: Story = {
  render: () => ({
    components: { DownloadButton },
    setup: () => simulate(true),
    template: `<DownloadButton v-model:state="state" :progress="progress" @click="start" />`,
  }),
}

/** In a list of files, a quiet button on each row. */
export const InRows: Story = {
  render: () => ({
    components: { DownloadButton },
    setup: () => ({ a: simulate(), b: simulate() }),
    template: `
      <ul class="w-96 divide-y divide-border">
        <li class="flex items-center justify-between py-3">
          <div><p class="text-label text-fg">unit-3-networks.pdf</p><p class="text-meta text-fg-muted">2.4 MB</p></div>
          <DownloadButton v-model:state="a.state.value" :progress="a.progress.value" variant="ghost" @click="a.start" />
        </li>
        <li class="flex items-center justify-between py-3">
          <div><p class="text-label text-fg">practice-2.zip</p><p class="text-meta text-fg-muted">18 MB</p></div>
          <DownloadButton v-model:state="b.state.value" :progress="b.progress.value" variant="ghost" @click="b.start" />
        </li>
      </ul>`,
  }),
}
