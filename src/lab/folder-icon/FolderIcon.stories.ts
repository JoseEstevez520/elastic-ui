import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FileIcon from '../../components/file-icon/FileIcon.vue'
import FolderIcon from './FolderIcon.vue'

const meta = { title: 'Lab/Folder icon', component: FolderIcon } satisfies Meta<typeof FolderIcon>
export default meta
type Story = StoryObj<typeof meta>

const modules = [
  { name: 'Web client', count: 24, color: 'var(--color-accent)' },
  { name: 'Web server', count: 18, color: 'light-dark(#7c3aed, #a78bfa)' },
  { name: 'Deployment', count: 11, color: 'var(--color-success)' },
  { name: 'Design', count: 9, color: 'light-dark(#db2777, #f472b6)' },
  { name: 'Company', count: 6, color: 'var(--color-warning)' },
]

/** A term's modules as folders: point at one and it opens, the pages inside rising. */
export const Modules: Story = {
  render: () => ({
    components: { FolderIcon },
    setup: () => ({ modules }),
    template: `
      <div class="flex flex-wrap gap-8">
        <button v-for="m in modules" :key="m.name" type="button" class="flex w-24 cursor-pointer flex-col items-center gap-2 rounded-xl p-2 focus-ring">
          <FolderIcon :color="m.color" />
          <span class="-mt-1 text-[11px] text-fg-faint tabular-nums">{{ m.count }} files</span>
          <span class="text-center text-xs text-fg-secondary">{{ m.name }}</span>
        </button>
      </div>`,
  }),
}

/** Beside FileIcon, as in the Files app: a folder, open, and the files it holds. */
export const WithFiles: Story = {
  render: () => ({
    components: { FileIcon, FolderIcon },
    template: `
      <div class="flex items-end gap-6">
        <FolderIcon open />
        <FileIcon name="unit-1.pdf" /><FileIcon name="lab.docx" /><FileIcon name="marks.xlsx" />
      </div>`,
  }),
}

/** Large, to look at the detail: at rest, and open. */
export const Large: Story = {
  render: () => ({
    components: { FolderIcon },
    template: `<div class="flex items-end gap-12 p-8"><FolderIcon class="h-32 w-40" /><FolderIcon open class="h-32 w-40" color="light-dark(#7c3aed, #a78bfa)" /><FolderIcon open class="h-32 w-40" color="var(--color-success)" /></div>`,
  }),
}
