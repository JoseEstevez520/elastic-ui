import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Button from '../button/Button.vue'
import Liquid from './Liquid.vue'

const meta = {
  title: 'Base/Liquid',
  component: Liquid,
  render: () => ({
    components: { Liquid, Button },
    setup: () => ({ joined: ref(false) }),
    template: `
      <div class="flex flex-col items-start gap-6">
        <Liquid fill="var(--color-accent)" :reach="6" class="h-12 w-48">
          <template #shapes>
            <div class="absolute top-0 left-0 size-12 rounded-full bg-black" />
            <div
              class="absolute top-0 left-36 size-12 rounded-full bg-black transition-[translate] duration-700 ease-[var(--ease-emphasized)] motion-reduce:transition-none"
              :style="{ translate: joined ? '-6.5rem 0' : '0 0' }"
            />
          </template>
        </Liquid>
        <Button variant="outline" size="sm" @click="joined = !joined">{{ joined ? 'Part them' : 'Bring them together' }}</Button>
      </div>`,
  }),
} satisfies Meta<typeof Liquid>

export default meta
type Story = StoryObj<typeof meta>

/** Two drops: brought close, they join by a liquid neck; pulled apart, the neck thins and lets go. */
export const Default: Story = {}

/**
 * A drop pulled out of its pill, past the component's own box: `overflow` leaves the filter room
 * for it, so it is not cut off on its way out.
 */
export const PulledOut: Story = {
  render: () => ({
    components: { Liquid, Button },
    setup: () => ({ out: ref(false) }),
    template: `
      <div class="flex flex-col items-start gap-6 pb-16">
        <Liquid fill="var(--color-fg)" :overflow="64" class="h-11 w-40">
          <template #shapes>
            <div class="absolute inset-0 rounded-full bg-black" />
            <div
              class="absolute top-0 right-0 size-11 rounded-full bg-black transition-[translate] duration-700 ease-[var(--ease-emphasized)] motion-reduce:transition-none"
              :style="{ translate: out ? '0 3.5rem' : '0 0' }"
            />
          </template>
        </Liquid>
        <Button variant="outline" size="sm" @click="out = !out">{{ out ? 'Take it back' : 'Pull it out' }}</Button>
      </div>`,
  }),
}
