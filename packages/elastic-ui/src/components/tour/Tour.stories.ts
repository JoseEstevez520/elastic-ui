import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Button from '../button/Button.vue'
import Tour from './Tour.vue'
import TourStep from './TourStep.vue'

/**
 * A guided tour of the real app, a step at a time: a ring and a card travel between the real
 * elements it explains (`data-tour="name"`), rather than appearing and disappearing.
 */
const meta = { title: 'Overlays/Tour', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/** A small page, toured end to end: the ring and the card travel between its three buttons. */
export const Default: Story = {
  render: () => ({
    components: { Tour, TourStep, Button },
    setup: () => ({ open: ref(true) }),
    template: `
      <div class="flex min-h-screen flex-col gap-10 p-16">
        <div class="flex items-center justify-between">
          <span class="text-title text-fg">Kolmi</span>
          <div class="flex gap-3">
            <Button data-tour="notes" variant="ghost">Notes</Button>
            <Button data-tour="admin" variant="ghost">Admin</Button>
          </div>
        </div>
        <div class="mt-20 flex justify-center">
          <Button data-tour="write">Leave a note</Button>
        </div>
        <Button variant="ghost" class="w-fit" @click="open = true">Start the tour again</Button>

        <Tour v-model:open="open">
          <TourStep target="write" title="Leave a note">
            Write whatever you want the hive to know; it saves itself as you go.
          </TourStep>
          <TourStep target="notes" title="Your notes">
            See every note you have left, and what became of it.
          </TourStep>
          <TourStep target="admin" title="Admin">
            Only admins see this: the whole tree, and the class settings.
          </TourStep>
        </Tour>
      </div>`,
  }),
}

/** Situation, count: one step alone, nothing to go back to. */
export const OneStep: Story = {
  render: () => ({
    components: { Tour, TourStep, Button },
    setup: () => ({ open: ref(true) }),
    template: `
      <div class="flex min-h-screen items-center justify-center p-16">
        <Button data-tour="only">The one thing to notice</Button>
        <Tour v-model:open="open">
          <TourStep target="only" title="Right here">This is the one thing worth pointing at.</TourStep>
        </Tour>
      </div>`,
  }),
}

/** Situation, count: many steps, "N of M" keeps up. */
export const ManySteps: Story = {
  render: () => ({
    components: { Tour, TourStep, Button },
    setup: () => ({ open: ref(true) }),
    template: `
      <div class="grid min-h-screen grid-cols-4 gap-6 p-16">
        <Button v-for="n in 8" :key="n" :data-tour="'s' + n" variant="ghost">Item {{ n }}</Button>
        <Tour v-model:open="open">
          <TourStep v-for="n in 8" :key="n" :target="'s' + n" :title="'Item ' + n">What item {{ n }} is for.</TourStep>
        </Tour>
      </div>`,
  }),
}

/** Situation, content: a long title and a long body still fit the card. */
export const LongContent: Story = {
  render: () => ({
    components: { Tour, TourStep, Button },
    setup: () => ({ open: ref(true) }),
    template: `
      <div class="flex min-h-screen items-center justify-center p-16">
        <Button data-tour="long">A button with a name</Button>
        <Tour v-model:open="open">
          <TourStep target="long" title="A title long enough to wrap onto a second line on its own">
            A body with several sentences, to see how the card grows to hold them rather than
            clipping the text or pushing the controls out of reach. It should read comfortably at
            the card's fixed width, wrapping as any paragraph does.
          </TourStep>
        </Tour>
      </div>`,
  }),
}

/** Situation, size: on a phone's width, the card keeps the screen's margin on both sides. */
export const Phone: Story = {
  render: () => ({
    components: { Tour, TourStep, Button },
    setup: () => ({ open: ref(true) }),
    template: `
      <div class="flex min-h-screen w-[360px] items-center justify-center p-8">
        <Button data-tour="phone">A button</Button>
        <Tour v-model:open="open">
          <TourStep target="phone" title="Fits a narrow screen">The card never runs past either edge.</TourStep>
        </Tour>
      </div>`,
  }),
}

/** Situation, size: the target near the bottom edge, the card flips above it instead of running off-screen. */
export const NearTheEdge: Story = {
  render: () => ({
    components: { Tour, TourStep, Button },
    setup: () => ({ open: ref(true) }),
    template: `
      <div class="flex min-h-screen flex-col justify-end p-16">
        <Button data-tour="bottom" class="w-fit">Down here</Button>
        <Tour v-model:open="open">
          <TourStep target="bottom" title="The card flips up">So it never runs past the bottom of the screen.</TourStep>
        </Tour>
      </div>`,
  }),
}

/** Situation, keyboard: Escape skips the whole tour; the arrow keys move between steps. */
export const Keyboard: Story = {
  render: () => ({
    components: { Tour, TourStep, Button },
    setup: () => ({ open: ref(true) }),
    template: `
      <div class="flex min-h-screen flex-col items-center justify-center gap-4 p-16">
        <p class="text-meta text-fg-muted">Press the right arrow to move on, the left to go back, Escape to skip.</p>
        <div class="flex gap-6">
          <Button data-tour="k1">First</Button>
          <Button data-tour="k2">Second</Button>
        </div>
        <Tour v-model:open="open">
          <TourStep target="k1" title="First">Press the right arrow.</TourStep>
          <TourStep target="k2" title="Second">Press Escape to skip from here.</TourStep>
        </Tour>
      </div>`,
  }),
}

/** Situation, languages: its own buttons in another language; labels can be set with `provideLabels`. */
export const Spanish: Story = {
  render: () => ({
    components: { Tour, TourStep, Button },
    setup: () => ({ open: ref(true) }),
    template: `
      <div class="flex min-h-screen items-center justify-center p-16">
        <Button data-tour="es">Dejar una nota</Button>
        <Tour v-model:open="open" next-label="Siguiente" back-label="Atrás" skip-label="Saltar" label="Visita guiada">
          <TourStep target="es" title="Deja una nota">Escribe lo que quieras que la colmena sepa.</TourStep>
        </Tour>
      </div>`,
  }),
}

/** Situation: a step on another "screen" — `beforeStep` switches which panel shows and waits a
 * moment (as a route change would), the ring and card holding their place meanwhile. */
export const AcrossScreens: Story = {
  render: () => ({
    components: { Tour, TourStep, Button },
    setup() {
      const open = ref(true)
      const screen = ref('home')
      function beforeStep(meta: { to?: unknown }) {
        if (!meta.to || meta.to === screen.value) return
        return new Promise<void>((resolve) =>
          setTimeout(() => {
            screen.value = meta.to as string
            resolve()
          }, 400),
        )
      }
      return { open, screen, beforeStep }
    },
    template: `
      <div class="flex min-h-screen flex-col gap-10 p-16">
        <div class="flex items-center justify-between">
          <span class="text-title text-fg">{{ screen === 'home' ? 'Home' : 'Notes' }}</span>
          <Button data-tour="notes-link" variant="ghost">Notes</Button>
        </div>
        <div v-if="screen === 'home'" class="mt-20 flex justify-center">
          <span data-tour="home" class="text-copy text-fg-secondary">The class, on Home.</span>
        </div>
        <div v-else class="mt-20 flex justify-center">
          <Button data-tour="new-note">New note</Button>
        </div>

        <Tour v-model:open="open" :before-step="beforeStep">
          <TourStep target="home" to="home" title="This is Home">Everything the class shares.</TourStep>
          <TourStep target="new-note" to="notes" title="Leave a note">
            This only exists on Notes: the tour gets there first.
          </TourStep>
        </Tour>
      </div>`,
  }),
}
