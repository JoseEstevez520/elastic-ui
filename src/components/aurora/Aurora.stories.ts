import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Button from '../button/Button.vue'
import Aurora from './Aurora.vue'

const meta = {
  title: 'Special/Aurora',
  component: Aurora,
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { Aurora, Button },
    setup: () => ({ settled: ref(false), activity: ref<'rest' | 'thinking' | 'answering'>('rest') }),
    template: `
      <Aurora :settled="settled" :activity="activity" class="flex h-screen flex-col items-center justify-center gap-6">
        <p class="text-2xl font-medium">What can I help with?</p>
        <div class="flex gap-2">
          <Button v-for="a in ['rest', 'thinking', 'answering']" :key="a" size="sm" :variant="activity === a ? 'solid' : 'outline'" @click="activity = a">{{ a }}</Button>
          <Button size="sm" variant="ghost" @click="settled = !settled">{{ settled ? 'Wake' : 'Settle' }}</Button>
        </div>
      </Aurora>`,
  }),
} satisfies Meta<typeof Aurora>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A few lights drift slowly behind the content. Thinking, they gather in and hurry; answering, they
 * spread and flow; settled, they calm and sink to a softer tint. The pace eases, never jumps.
 */
export const Default: Story = {}
