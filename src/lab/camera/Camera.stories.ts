import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Button from '../../components/button/Button.vue'
import DialogMorph from '../../components/dialog-morph/DialogMorph.vue'
import DialogMorphClose from '../../components/dialog-morph/DialogMorphClose.vue'
import DialogMorphDescription from '../../components/dialog-morph/DialogMorphDescription.vue'
import DialogMorphTitle from '../../components/dialog-morph/DialogMorphTitle.vue'
import PageTransition from '../../components/page-transition/PageTransition.vue'
import Sheet from '../../components/sheet/Sheet.vue'
import Tabs from '../../components/tabs/Tabs.vue'
import TabsList from '../../components/tabs/TabsList.vue'
import TabsTrigger from '../../components/tabs/TabsTrigger.vue'
import './camera.css'
import DevelopCard from './DevelopCard.vue'
import RackFocus from './RackFocus.vue'

/**
 * Lab: the library as a camera. Three ideas, each shown as the library does it today ("Now") and
 * as it could ("Camera"), on the same scene, to compare.
 */
const meta = { title: 'Lab/Camera', parameters: { layout: 'fullscreen' } } satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

// A page to put things over: a photo and text, so blur and dimming both show.
const article = `
  <article class="mx-auto max-w-2xl px-6 py-10">
    <img src="https://picsum.photos/id/1015/1200/700" alt="" class="aspect-[16/9] w-full rounded-[24px] object-cover" />
    <h1 class="mt-8 text-3xl font-semibold tracking-tight text-fg">Trail maps with no signal</h1>
    <p class="mt-4 text-fg-secondary">The brief was a small site that had to work offline, for people walking where there is no signal. Everything it needs is kept on the phone the first time it opens.</p>
    <div class="mt-6 flex gap-3">
      <Sheet><template #trigger>Settings</template>
        <DialogMorphTitle>Settings</DialogMorphTitle>
        <DialogMorphDescription>How the map looks and what it tells you.</DialogMorphDescription>
      </Sheet>
      <DialogMorph><template #trigger>Delete route</template>
        <DialogMorphTitle>Delete this route?</DialogMorphTitle>
        <DialogMorphDescription>It goes from every phone that has it.</DialogMorphDescription>
        <div class="mt-6 flex justify-end gap-2">
          <DialogMorphClose as-child><Button variant="ghost">Cancel</Button></DialogMorphClose>
          <DialogMorphClose as-child><Button>Delete</Button></DialogMorphClose>
        </div>
      </DialogMorph>
    </div>
    <p class="mt-6 text-fg-secondary">The map is drawn from vector tiles, so it stays sharp at every zoom and weighs a fraction of the images it replaced.</p>
  </article>`
const overlayParts = { Button, DialogMorph, DialogMorphClose, DialogMorphDescription, DialogMorphTitle, Sheet }

/** 1 · Now: a dialog or a sheet dims the page behind it. */
export const DepthNow: Story = { render: () => ({ components: overlayParts, template: article }) }

/** 1 · Camera: the page behind goes a little out of focus, and dims less, as a lens focusing close. */
export const DepthOfField: Story = {
  render: () => ({
    components: overlayParts,
    setup() {
      onMounted(() => document.documentElement.classList.add('lab-depth'))
      onBeforeUnmount(() => document.documentElement.classList.remove('lab-depth'))
    },
    template: article,
  }),
}

// Two pages to go between.
const pages = {
  notes: {
    title: 'Notes',
    text: 'What an agent is, how it reads, acts and checks, and why a loop makes it one.',
    src: 'https://picsum.photos/id/1036/1200/600',
  },
  tasks: {
    title: 'Tasks',
    text: 'Due this week: the Docker lab, the deployment report, and a quiz on networks.',
    src: 'https://picsum.photos/id/1043/1200/600',
  },
  marks: {
    title: 'Marks',
    text: 'The term so far, subject by subject, with what is still to come.',
    src: 'https://picsum.photos/id/1080/1200/600',
  },
}
const pageScene = (transition: string) => ({
  components: { PageTransition, RackFocus, Tabs, TabsList, TabsTrigger },
  setup: () => ({ page: ref<keyof typeof pages>('notes'), pages }),
  template: `
    <div class="mx-auto max-w-2xl px-6 py-10">
      <!-- The pages' photos, fetched ahead, as a router would have them cached. -->
      <img v-for="p in pages" :key="p.src" :src="p.src" alt="" class="hidden" />
      <Tabs v-model="page"><TabsList><TabsTrigger v-for="(p, k) in pages" :key="k" :value="k">{{ p.title }}</TabsTrigger></TabsList></Tabs>
      <${transition} :page="page">
        <img :src="pages[page].src" alt="" class="mt-8 aspect-[2/1] w-full rounded-[24px] object-cover" />
        <h1 class="mt-8 text-3xl font-semibold tracking-tight text-fg">{{ pages[page].title }}</h1>
        <p class="mt-4 text-fg-secondary">{{ pages[page].text }}</p>
      </${transition}>
    </div>`,
})

/** 2 · Now: from page to page, the old fades and the new fades in. */
export const PagesNow: Story = { render: () => pageScene('PageTransition') }

/** 2 · Camera: the old drifts out of focus as the new comes into focus, as a camera pulling focus. */
export const PagesRackFocus: Story = { render: () => pageScene('RackFocus') }

const loadScene = (look: string) => ({
  components: { Button, DevelopCard },
  setup: () => {
    const cards = ref<InstanceType<typeof DevelopCard>[]>([])
    return { look, cards, reload: () => cards.value.forEach((c) => c.reload()) }
  },
  template: `
    <div class="mx-auto max-w-4xl px-6 py-10">
      <Button variant="outline" @click="reload">Load again</Button>
      <div class="mt-6 grid gap-6 sm:grid-cols-3">
        <DevelopCard v-for="id in [1015, 1080, 1043]" :key="id" ref="cards" :id="id" :look="look" />
      </div>
    </div>`,
})

/** 3 · Now (the usual way): grey bars pulsing, then the content comes into focus. */
export const LoadingSkeleton: Story = { render: () => loadScene('skeleton') }

/** 3 · Camera: a wash of what is coming, which develops into the photo and its words. */
export const LoadingDevelop: Story = { render: () => loadScene('develop') }
