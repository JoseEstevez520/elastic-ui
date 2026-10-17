import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Trash2 } from '@lucide/vue'
import { ref } from 'vue'
import AlertDialog from './AlertDialog.vue'

const meta = {
  title: 'Overlays/AlertDialog',
  component: AlertDialog,
  args: { title: 'Delete this practice?', confirmLabel: 'Delete' },
  render: (args) => ({
    components: { AlertDialog, Trash2 },
    setup: () => ({ args, deleted: ref(false) }),
    template: `
      <div class="flex items-center gap-4">
        <AlertDialog
          v-bind="args"
          description="Its files and its grade go with it. This cannot be undone."
          tone="danger"
          @confirm="deleted = true"
        >
          <template #trigger><span class="flex items-center gap-2"><Trash2 class="size-4" aria-hidden="true" />Delete</span></template>
        </AlertDialog>
        <p class="text-sm text-fg-muted">{{ deleted ? 'Deleted.' : 'Not deleted.' }}</p>
      </div>`,
  }),
} satisfies Meta<typeof AlertDialog>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The button grows into the question; a click outside does nothing, Escape or Cancel go back, and
 * Delete, in the danger colour, goes ahead. The focus starts on Cancel.
 */
export const Default: Story = {}
