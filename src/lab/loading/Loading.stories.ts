import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import FileIcon from '../../components/file-icon/FileIcon.vue'
import Loading from './Loading.vue'

/**
 * Lab: loading that becomes its content. Press "Load": the still shapes stretch into the pieces
 * that arrive, which come into focus inside them.
 */
const meta = { title: 'Lab/Loading' } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const scene = {
  components: { FileIcon, Loading },
  setup: () => {
    const loading = ref(true)
    const load = () => {
      loading.value = true
      setTimeout(() => (loading.value = false), 900)
    }
    return { loading, load, files: ['unit-3-networks.pdf', 'docker-lab.docx', 'marks-term-1.xlsx'] }
  },
  template: `
    <div class="flex flex-col gap-6">
      <button type="button" class="h-9 w-fit cursor-pointer rounded-full bg-[color:var(--color-fg)] px-4 text-sm font-medium text-[color:var(--color-bg)] focus-ring" @click="load">Load</button>
      <div class="flex flex-wrap items-start gap-8">
        <!-- A card: its photo, its title, its words. -->
        <Loading :loading="loading" class="w-72">
          <template #placeholder>
            <div class="flex flex-col gap-3">
              <div data-shape="image" class="aspect-[4/3] w-full rounded-2xl bg-surface" />
              <div data-shape="title" class="h-5 w-2/3 rounded-md bg-surface" />
              <div data-shape="text" class="h-10 w-11/12 rounded-md bg-surface" />
            </div>
          </template>
          <div class="flex flex-col gap-3">
            <img data-shape="image" src="https://picsum.photos/id/1036/600/450" alt="" class="aspect-[4/3] w-full rounded-2xl object-cover" />
            <h3 data-shape="title" class="text-lg font-semibold text-fg">Winter light</h3>
            <p data-shape="text" class="text-sm text-fg-secondary">A season in the mountains, told in twelve walks and the light of each month.</p>
          </div>
        </Loading>
        <!-- A list of files. -->
        <Loading :loading="loading" class="w-80">
          <template #placeholder>
            <ul class="flex flex-col">
              <li v-for="n in 3" :key="n" class="flex h-14 items-center gap-3">
                <div :data-shape="'icon' + n" class="h-10 w-8 rounded-md bg-surface" />
                <div :data-shape="'name' + n" class="h-4 w-40 rounded-md bg-surface" />
              </li>
            </ul>
          </template>
          <ul class="flex flex-col">
            <li v-for="(f, i) in files" :key="f" class="flex h-14 items-center gap-3">
              <FileIcon :data-shape="'icon' + (i + 1)" :name="f" />
              <span :data-shape="'name' + (i + 1)" class="text-sm text-fg">{{ f }}</span>
            </li>
          </ul>
        </Loading>
      </div>
    </div>`,
}

export const Default: Story = { render: () => scene }
