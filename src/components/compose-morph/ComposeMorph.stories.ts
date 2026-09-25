import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ComposeMorph from './ComposeMorph.vue'
import type { Composed } from './ComposeMorph.vue'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const send = async (composed: Composed) => {
  await wait(1200)
  console.log('Sent', composed)
}

const meta = {
  title: 'Actions/ComposeMorph',
  // Top-aligned: centering would re-center the button as it grows into the form.
  render: () => ({
    components: { ComposeMorph },
    setup: () => ({ send }),
    template: `<ComposeMorph :submit="send" />`,
  }),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** A comment: the button becomes the form, sends with its own progress, and folds back. */
export const Default: Story = {}

/** Feedback, with a rating of emoji faces. */
export const Feedback: Story = {
  render: () => ({
    components: { ComposeMorph },
    setup: () => ({ send }),
    template: `
      <ComposeMorph
        :submit="send"
        label="Feedback"
        placeholder="What could be better?"
        :ratings="['😞', '😕', '🙂', '🤩']"
        thanks="Thanks for your feedback!"
      />`,
  }),
}

/** A reply under someone's comment, in a thread. */
export const Reply: Story = {
  render: () => ({
    components: { ComposeMorph },
    setup: () => ({ send }),
    template: `
      <div class="flex max-w-md flex-col gap-2">
        <p class="text-sm text-fg"><span class="font-medium">Ada</span> · Does the exam include unit 4?</p>
        <ComposeMorph :submit="send" label="Reply" placeholder="Write a reply…" send-label="Reply" sending-label="Replying" sent-label="Replied" thanks="Reply posted" />
      </div>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** Sending fails: the button says so and the message stays for another try. */
export const Failing: Story = {
  render: () => ({
    components: { ComposeMorph },
    setup: () => ({
      fail: async () => {
        await wait(1000)
        throw new Error('Network down')
      },
    }),
    template: `<ComposeMorph :submit="fail" />`,
  }),
}

/** In Spanish, lined up with the end of a toolbar. */
export const Localized: Story = {
  render: () => ({
    components: { ComposeMorph },
    setup: () => ({ send }),
    template: `
      <div class="flex justify-end">
        <ComposeMorph
          :submit="send"
          align="end"
          label="Añadir nota"
          placeholder="Escribe una nota…"
          send-label="Guardar"
          sending-label="Guardando"
          sent-label="Guardada"
          thanks="Nota guardada"
        />
      </div>`,
  }),
}
