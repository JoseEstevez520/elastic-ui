import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Field from '../field/Field.vue'
import type { Uploader, UploadFile } from './file-upload.types'
import FileUpload from './FileUpload.vue'

// Goes up in about two seconds, in uneven steps as a network would; a file named with "fail" fails.
const fakeUpload: Uploader = (file, progress) =>
  new Promise((resolve, reject) => {
    let done = 0
    const tick = () => {
      done = Math.min(1, done + 0.08 + Math.random() * 0.12)
      progress(done)
      if (file.name.includes('fail') && done > 0.5) return reject(new Error('The server refused it'))
      if (done >= 1) return resolve()
      setTimeout(tick, 150 + Math.random() * 200)
    }
    setTimeout(tick, 200)
  })

const meta = {
  title: 'Forms/FileUpload',
  component: FileUpload,
  render: (args) => ({
    components: { FileUpload },
    setup: () => ({ args, files: ref<UploadFile[]>([]), fakeUpload }),
    template: `<FileUpload v-bind="args" v-model="files" :upload="fakeUpload" class="w-96" />`,
  }),
} satisfies Meta<typeof FileUpload>

export default meta
type Story = StoryObj<typeof meta>

/** Drop files on it, or press it to choose them: each becomes its row, which fills as it goes up. */
export const Default: Story = {}

/** Without `upload`, the files are only listed, to send with a form. */
export const InForm: Story = {
  render: () => ({
    components: { Field, FileUpload },
    setup: () => ({ files: ref<UploadFile[]>([]) }),
    template: `
      <Field label="Attachments" description="PDF, up to 2 MB each." class="w-96">
        <FileUpload v-model="files" accept=".pdf" :max-size="2 * 1024 * 1024" />
      </Field>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** Files already there, done, going up, too large and failed. */
export const EveryState: Story = {
  render: () => ({
    components: { FileUpload },
    setup: () => ({
      files: ref<UploadFile[]>([
        { id: '1', name: 'report.pdf', size: 482_000, status: 'done' },
        {
          id: '2',
          name: 'photos-of-the-trip-to-the-mountains.zip',
          size: 24_600_000,
          status: 'uploading',
          progress: 0.42,
        },
        { id: '3', name: 'video.mov', size: 812_000_000, status: 'error', error: 'Larger than 100 MB' },
        { id: '4', name: 'notes.txt', size: 2_300, status: 'error', error: 'The server refused it' },
      ]),
      fakeUpload,
    }),
    template: `<FileUpload v-model="files" :upload="fakeUpload" class="w-96" />`,
  }),
}

export const OneFile: Story = { args: { multiple: false } }

export const Disabled: Story = { args: { disabled: true } }
