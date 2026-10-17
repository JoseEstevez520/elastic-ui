import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FileIcon from './FileIcon.vue'

const meta = {
  title: 'Base/FileIcon',
  component: FileIcon,
  args: { name: 'syllabus.pdf' },
} satisfies Meta<typeof FileIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

const names = [
  'notes.pdf',
  'essay.docx',
  'marks.xlsx',
  'talk.pptx',
  'project.zip',
  'server.js',
  'demo.mp4',
  'podcast.mp3',
  'readme',
  'backup.tar.gz',
]

/** Each kind in its colour, its extension on its page. */
export const Kinds: Story = {
  render: () => ({
    components: { FileIcon },
    setup: () => ({ names }),
    template: `
      <div class="flex flex-wrap gap-6">
        <figure v-for="n in names" :key="n" class="flex w-16 flex-col items-center gap-2">
          <FileIcon :name="n" size="lg" />
          <figcaption class="w-full truncate text-center text-xs text-fg-muted">{{ n }}</figcaption>
        </figure>
      </div>`,
  }),
}

/** An image shows itself, coming into focus once loaded. */
export const Image: Story = {
  args: { name: 'mountains.jpg', size: 'lg', src: 'https://picsum.photos/id/1018/200/260' },
}

/** Three sizes: a line of text, a list, a card. Small, too small for letters, only its tint says the kind. */
export const Sizes: Story = {
  render: () => ({
    components: { FileIcon },
    template: `<div class="flex items-end gap-4"><FileIcon name="a.pdf" size="sm" /><FileIcon name="a.pdf" /><FileIcon name="a.pdf" size="lg" /></div>`,
  }),
}
