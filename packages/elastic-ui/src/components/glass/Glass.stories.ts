import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Aurora from '../aurora/Aurora.vue'
import Glow from '../glow/Glow.vue'

/**
 * Glass, the material for what sits over colour: the `glass` utility (and its `--glass-*` tokens).
 * A white veil that lets the colour through, the colour behind it blurred, a barely-there shadow.
 * Over an Aurora (as ChatMorph's composer and messages) or a Glow, `glass`; over a photo, whose
 * light and dark parts vary, the denser `glass-strong`.
 */
const meta = { title: 'Base/Glass' } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const OverAurora: Story = {
  render: () => ({
    components: { Aurora },
    template: `
      <Aurora class="grid h-72 w-[26rem] place-items-center rounded-[2rem]">
        <div class="glass w-72 rounded-2xl p-4 text-sm text-fg">
          <p class="font-medium">Glass over the Aurora</p>
          <p class="mt-1 text-fg-secondary">The colour comes through, blurred; the text reads on it.</p>
        </div>
      </Aurora>`,
  }),
}

export const OverGlowAndPhoto: Story = {
  render: () => ({
    components: { Glow },
    template: `
      <div class="flex flex-wrap gap-6">
        <div class="relative isolate grid h-72 w-72 place-items-end overflow-hidden rounded-[2rem] p-4">
          <Glow src="https://picsum.photos/id/1080/600/600" class="-z-10" />
          <div class="glass w-full rounded-2xl p-3 text-sm"><p class="font-medium text-fg">Market</p><p class="text-fg-secondary">Street sounds</p></div>
        </div>
        <div class="relative grid h-72 w-72 place-items-end overflow-hidden rounded-[2rem] p-4">
          <img src="https://picsum.photos/id/1015/600/600" alt="" class="absolute inset-0 size-full object-cover" />
          <div class="glass-strong relative w-full rounded-2xl p-3 text-sm"><p class="font-medium text-fg">River valley</p><p class="text-fg-secondary">Field recordings</p></div>
        </div>
      </div>`,
  }),
}
