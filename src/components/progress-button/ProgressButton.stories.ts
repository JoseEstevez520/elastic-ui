import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Download, Send, Upload } from '@lucide/vue'
import { onBeforeUnmount, ref } from 'vue'
import ProgressButton from './ProgressButton.vue'
import type { ProgressButtonState } from './ProgressButton.vue'

const icons = { Download, Send, Upload }

/** Fakes a job that reports its progress, as an export or an upload would. */
function useFakeJob(step = 9, every = 250, fails = false) {
  const state = ref<ProgressButtonState>('idle')
  const progress = ref(0)
  let timer: ReturnType<typeof setInterval> | undefined
  const start = () => {
    state.value = 'working'
    progress.value = 0
    timer = setInterval(() => {
      progress.value = Math.min(100, progress.value + step)
      if (fails && progress.value >= 60) {
        clearInterval(timer)
        state.value = 'error'
      } else if (progress.value === 100) {
        clearInterval(timer)
        state.value = 'done'
      }
    }, every)
  }
  onBeforeUnmount(() => clearInterval(timer))
  return { state, progress, start }
}

const meta = {
  title: 'Base/ProgressButton',
  render: () => ({
    components: { ProgressButton },
    setup: () => ({ ...useFakeJob(), icons }),
    template: `
      <ProgressButton
        v-model:state="state"
        :progress="progress"
        :icon="icons.Download"
        label="Export"
        working-label="Exporting"
        done-label="Exported"
        @click="start"
      />`,
  }),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Export turns into its own progress, then into "Exported", and back. */
export const Default: Story = {}

/** No amount to report: the label shimmers while it works. */
export const WithoutAmount: Story = {
  render: () => ({
    components: { ProgressButton },
    setup() {
      const state = ref<ProgressButtonState>('idle')
      const send = () => {
        state.value = 'working'
        setTimeout(() => (state.value = 'done'), 1800)
      }
      return { state, send, icons }
    },
    template: `
      <ProgressButton v-model:state="state" :icon="icons.Send" variant="solid" label="Send" working-label="Sending" done-label="Sent" @click="send" />`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** A job that fails part way: the button says so, then goes back to itself. */
export const Failing: Story = {
  render: () => ({
    components: { ProgressButton },
    setup: () => ({ ...useFakeJob(9, 250, true), icons }),
    template: `
      <ProgressButton
        v-model:state="state"
        :progress="progress"
        :icon="icons.Upload"
        label="Upload"
        working-label="Uploading"
        done-label="Uploaded"
        error-label="Upload failed"
        @click="start"
      />`,
  }),
}

/** Labels much longer than in English: the width follows the text as it changes. */
export const LongLabels: Story = {
  render: () => ({
    components: { ProgressButton },
    setup: () => ({ ...useFakeJob(), icons }),
    template: `
      <ProgressButton
        v-model:state="state"
        :progress="progress"
        :icon="icons.Download"
        label="Exportar informe"
        working-label="Exportando informe"
        done-label="Informe exportado correctamente"
        @click="start"
      />`,
  }),
}
