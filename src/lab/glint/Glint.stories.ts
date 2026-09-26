import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Aurora from '../../components/aurora/Aurora.vue'
import FileIcon from '../../components/file-icon/FileIcon.vue'
import './glint.css'

/**
 * Lab: the glint, the shimmer's light crossing a surface once when something has just gone well.
 * Press "Glint" to see it pass over each surface: a saved note, an uploaded file, a published
 * button, an answer on glass.
 */
const meta = { title: 'Lab/Glint' } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Surfaces: Story = {
  render: () => ({
    components: { Aurora, FileIcon },
    setup: () => {
      const glint = ref<'a' | 'b'>()
      const play = () => (glint.value = glint.value === 'a' ? 'b' : 'a')
      return { glint, play }
    },
    template: `
      <div class="flex flex-col gap-8 p-6">
        <button type="button" class="h-9 w-fit cursor-pointer rounded-full bg-[color:var(--color-fg)] px-4 text-sm font-medium text-[color:var(--color-bg)] focus-ring" @click="play">Glint</button>
        <div class="flex flex-wrap items-center gap-6">
          <!-- A saved note: a card on the page. -->
          <div class="lab-glint relative w-64 overflow-hidden rounded-2xl bg-surface p-4" :data-glint="glint">
            <p class="text-sm font-medium text-fg">Notes saved</p>
            <p class="mt-1 text-sm text-fg-secondary">Unit 3, networks. Everyone in the class can see them.</p>
          </div>
          <!-- A file just uploaded. -->
          <div class="lab-glint relative flex h-14 w-72 items-center gap-3 overflow-hidden rounded-xl bg-surface px-3" :data-glint="glint">
            <FileIcon name="unit-3.pdf" />
            <span class="flex-1 text-sm text-fg">unit-3.pdf</span>
            <span class="text-xs text-[color:var(--color-success)]">Uploaded</span>
          </div>
          <!-- A primary button whose action went through. -->
          <span class="lab-glint relative inline-flex h-10 items-center overflow-hidden rounded-[var(--radius-md)] bg-[color:var(--color-accent)] px-4 text-sm font-medium text-[color:var(--color-accent-fg)]" :data-glint="glint">Published</span>
          <!-- Glass over the Aurora. -->
          <Aurora class="grid h-40 w-72 place-items-center rounded-3xl">
            <div class="lab-glint glass relative overflow-hidden rounded-2xl px-4 py-3 text-sm text-fg" :data-glint="glint">Answer ready</div>
          </Aurora>
        </div>
      </div>`,
  }),
}
