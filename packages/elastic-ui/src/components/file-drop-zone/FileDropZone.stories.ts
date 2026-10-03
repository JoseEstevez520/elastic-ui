import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import FileUpload from '../file-upload/FileUpload.vue'
import type { UploadFile } from '../file-upload/file-upload.types'
import Textarea from '../input/Textarea.vue'
import FileDropZone from './FileDropZone.vue'

const meta = {
  title: 'Forms/FileDropZone',
  component: FileDropZone,
  render: (args) => ({
    components: { FileDropZone, Textarea },
    setup: () => ({ args, names: ref<string[]>([]) }),
    template: `
      <FileDropZone v-bind="args" class="w-[28rem] rounded-[var(--radius-lg)] p-4" @add="names.push(...$event.map((f) => f.name))">
        <Textarea placeholder="Write here. Drag a file over this box, or paste one." rows="6" />
        <p class="mt-2 text-meta text-fg-muted">Taken: {{ names.join(', ') || 'nothing yet' }}</p>
      </FileDropZone>`,
  }),
  args: { paste: true },
} satisfies Meta<typeof FileDropZone>

export default meta
type Story = StoryObj<typeof meta>

/** Nothing shows until a file is held over it; the text stays selectable and typeable. */
export const Default: Story = {}

/** Over a FileUpload `compact`: what the zone takes goes in through the part's exposed `add`. */
export const WithCompactUpload: Story = {
  render: () => ({
    components: { FileDropZone, FileUpload, Textarea },
    setup: () => ({ files: ref<UploadFile[]>([]), upload: ref<InstanceType<typeof FileUpload>>() }),
    template: `
      <FileDropZone paste class="w-[28rem] rounded-[var(--radius-lg)] p-4" @add="upload?.add($event)">
        <Textarea placeholder="Drag files over this box." rows="4" />
        <FileUpload ref="upload" v-model="files" compact class="mt-3" />
      </FileDropZone>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

export const Dark: Story = { globals: { theme: 'dark' } }

export const PhoneWidth: Story = { globals: { viewport: { value: 'mobile1', isRotated: false } } }

export const Disabled: Story = { args: { disabled: true } }
