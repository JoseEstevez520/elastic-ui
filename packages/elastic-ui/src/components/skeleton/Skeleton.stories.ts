import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { onBeforeUnmount, ref } from 'vue'
import Button from '../button/Button.vue'
import Card from '../card/Card.vue'
import Skeleton from './Skeleton.vue'
import SkeletonText from './SkeletonText.vue'

const meta = {
  title: 'Content/Skeleton',
  component: Skeleton,
  parameters: { layout: 'centered' },
  args: { class: 'h-4 w-48' },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** A round one, for an avatar, beside the lines of a name and a role. */
export const Circle: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div class="flex items-center gap-3" aria-busy="true">
        <Skeleton circle class="size-10" />
        <div class="flex flex-col gap-2"><Skeleton class="h-3.5 w-32" /><Skeleton class="h-3 w-20" /></div>
      </div>`,
  }),
}

/** Situation, a paragraph still to come: the last line is shorter; one line has no short end. */
export const Text: Story = {
  render: () => ({
    components: { SkeletonText },
    template: `<div class="flex w-80 flex-col gap-6" aria-busy="true"><SkeletonText /><SkeletonText :lines="5" /><SkeletonText :lines="1" /></div>`,
  }),
}

/** A recipe, not a part: a card with a title line and three text lines, in a grid. */
export const CardGrid: Story = {
  parameters: { layout: 'padded' },
  render: () => ({
    components: { Skeleton, SkeletonText, Card },
    template: `
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        <Card v-for="n in 6" :key="n" class="flex flex-col gap-4 p-5">
          <Skeleton class="h-5 w-2/5" />
          <SkeletonText :lines="3" />
        </Card>
      </div>`,
  }),
}

/** Situation, the real thing arriving: the placeholders give way to the content, which comes into focus. */
export const Arriving: Story = {
  render: () => ({
    components: { Skeleton, SkeletonText, Card, Button },
    setup() {
      const loaded = ref(false)
      let timer: ReturnType<typeof setTimeout> | undefined
      const reload = () => {
        loaded.value = false
        clearTimeout(timer)
        timer = setTimeout(() => (loaded.value = true), 1800)
      }
      reload()
      onBeforeUnmount(() => clearTimeout(timer))
      return { loaded, reload }
    },
    template: `
      <div class="flex w-80 flex-col items-center gap-6">
        <Card class="flex w-full flex-col gap-4 p-5" :aria-busy="!loaded">
          <template v-if="loaded">
            <p class="text-title text-fg animate-blur-in motion-reduce:animate-none">Servlets and filters</p>
            <p class="text-copy text-fg-secondary animate-blur-in motion-reduce:animate-none">A filter sits in front of a servlet and can change the request before it arrives.</p>
          </template>
          <template v-else>
            <Skeleton class="h-5 w-2/5" />
            <SkeletonText :lines="3" />
          </template>
        </Card>
        <Button variant="ghost" @click="reload">Load again</Button>
      </div>`,
  }),
}
