import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Button from '../button/Button.vue'
import Toaster from './Toaster.vue'
import { createToastStore } from './toast.store'

// In an app, its one Toaster reads the app's queue and `toast()` shows a toast from anywhere. Here
// each story is given a queue of its own, as a page showing several Toasters must be, so a click
// in one example never shows up in the others.

let saved = 0

const meta = {
  title: 'Overlays/Toast',
  parameters: { layout: 'fullscreen' },
  render: (args) => ({
    components: { Button, Toaster },
    setup() {
      const queue = createToastStore()
      const { toast } = queue
      return {
        args,
        queue,
        saved: () => toast({ title: 'Changes saved', description: `Version ${++saved} is live.` }),
        archived: () =>
          toast({
            title: 'Project archived',
            action: { label: 'Undo', onClick: () => toast({ title: 'Project restored' }) },
          }),
        sticky: () => toast({ title: 'Connection lost', description: 'Stays until dismissed.', duration: Infinity }),
      }
    },
    template: `
      <div class="flex min-h-screen flex-wrap content-start gap-2 p-6">
        <Button variant="outline" @click="saved">Show a toast</Button>
        <Button variant="outline" @click="archived">With an action</Button>
        <Button variant="ghost" @click="sticky">Until dismissed</Button>
        <Toaster v-bind="args" :store="queue" />
      </div>`,
  }),
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

/** New toasts arrive from the bottom edge; hover to keep them on screen. */
export const Default: Story = {}

export const TopRight: Story = { args: { position: 'top-right' } }

export const BottomCenter: Story = { args: { position: 'bottom-center' } }

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** Many in a row: past three, the oldest fades out as each new one arrives. */
export const Many: Story = {
  render: () => ({
    components: { Button, Toaster },
    setup() {
      const queue = createToastStore()
      const { toast } = queue
      let n = 0
      const burst = () => {
        for (let i = 0; i < 5; i++) setTimeout(() => toast({ title: `Upload ${++n} finished` }), i * 250)
      }
      return { queue, burst }
    },
    template: `
      <div class="min-h-screen p-6">
        <Button variant="outline" @click="burst">Five in a row</Button>
        <Toaster :store="queue" />
      </div>`,
  }),
}

/** Long text wraps; the toast grows taller rather than wider. */
export const LongText: Story = {
  render: () => ({
    components: { Button, Toaster },
    setup() {
      const queue = createToastStore()
      const { toast } = queue
      const long = () =>
        toast({
          title: 'No se ha podido sincronizar la carpeta compartida',
          description:
            'Comprueba tu conexión a internet y que sigues teniendo permiso de escritura en la carpeta. Lo volveremos a intentar automáticamente en unos minutos.',
        })
      return { queue, long }
    },
    template: `
      <div class="min-h-screen p-6">
        <Button variant="outline" @click="long">Long toast</Button>
        <Toaster :store="queue" />
      </div>`,
  }),
}
