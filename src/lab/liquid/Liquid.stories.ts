import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Download, Link, Mail, Share2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import Liquid from './Liquid.vue'

const meta = { title: 'Lab/Liquid', component: Liquid } satisfies Meta<typeof Liquid>
export default meta
type Story = StoryObj<typeof meta>

/**
 * A button that splits into its actions: "Share" parts into three round drops that pull out of it
 * one after another, and melt back into it when closed. The drops are the liquid's shapes; the
 * buttons ride above them.
 */
export const SplitButton: Story = {
  render: () => ({
    components: { Liquid, Share2, Link, Mail, Download },
    setup: () => {
      const open = ref(false)
      const actions = [
        { icon: Link, label: 'Copy link' },
        { icon: Mail, label: 'Email' },
        { icon: Download, label: 'Download' },
      ]
      // Where each drop sits: tucked under the pill's end, or out to its own place beside it.
      const at = (i: number) => (open.value ? 128 + i * 52 : 60)
      return { open, actions, at }
    },
    template: `
      <div class="p-10">
        <Liquid class="h-11 w-[300px]">
          <template #shapes>
            <div class="absolute top-0 left-0 h-11 w-[104px] rounded-full bg-black" />
            <div
              v-for="(a, i) in actions" :key="a.label"
              class="absolute top-0 size-11 rounded-full bg-black transition-[left] duration-500 ease-glide motion-reduce:transition-none"
              :style="{ left: at(i) + 'px', transitionDelay: (open ? i * 60 : (actions.length - 1 - i) * 40) + 'ms' }"
            />
          </template>
          <button type="button" :aria-expanded="open" class="absolute top-0 left-0 flex h-11 w-[104px] cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-medium text-fg focus-ring" @click="open = !open">
            <Share2 class="size-4" aria-hidden="true" /> Share
          </button>
          <button
            v-for="(a, i) in actions" :key="a.label"
            type="button" :aria-label="a.label" :tabindex="open ? 0 : -1"
            :class="['absolute top-0 flex size-11 cursor-pointer items-center justify-center rounded-full text-fg-secondary hover:text-fg focus-ring motion-reduce:transition-none', open ? 'opacity-100' : 'pointer-events-none opacity-0']"
            :style="{
              left: at(i) + 'px',
              // Its icon waits until its drop has pulled free, so nothing shows over the liquid
              // while drops are still joined; closing, the icons go first, then the drops melt back.
              transition: open
                ? 'left 500ms var(--ease-glide) ' + i * 60 + 'ms, opacity 250ms linear ' + (i * 60 + 380) + 'ms'
                : 'left 500ms var(--ease-glide) ' + (actions.length - 1 - i) * 40 + 'ms, opacity 120ms linear',
            }"
          >
            <component :is="a.icon" class="size-4" aria-hidden="true" />
          </button>
        </Liquid>
      </div>`,
  }),
}

/**
 * A carousel's dots: the current one stretches towards the next as a drop does and lets go of
 * where it was, rather than one dot switching off as another switches on.
 */
export const Dots: Story = {
  render: () => ({
    components: { Liquid },
    setup: () => {
      const count = 5
      const current = ref(0)
      const previous = ref(0)
      const go = (i: number) => {
        previous.value = current.value
        current.value = i
      }
      // The active blob runs from the nearer to the farther dot, then settles on the new one:
      // its leading edge moves first and its trailing edge follows.
      const DOT = 8
      const GAP = 14
      const x = (i: number) => i * (DOT + GAP)
      const lead = computed(() => x(current.value))
      return { count, current, previous, go, DOT, GAP, x, lead }
    },
    template: `
      <div class="flex flex-col items-start gap-6 p-10">
        <!-- The resting dots, faint, under the liquid: the liquid keeps only what is solid. -->
        <div class="relative h-2" :style="{ width: x(count - 1) + DOT + 'px' }">
          <div v-for="i in count" :key="i" class="absolute top-0 size-2 rounded-full bg-[color:var(--color-fg-faint)] opacity-50" :style="{ left: x(i - 1) + 'px' }" />
        <Liquid class="absolute inset-0" fill="var(--color-fg)" :reach="2">
          <template #shapes>
            <div
              class="absolute top-0 h-2 rounded-full bg-black"
              :style="{
                left: Math.min(x(current), x(previous)) + 'px',
                width: Math.abs(x(current) - x(previous)) + DOT + 'px',
                transition: 'left 420ms var(--ease-glide), width 420ms var(--ease-glide)',
              }"
              @transitionend="previous = current"
            />
          </template>
        </Liquid>
        </div>
        <div class="flex gap-2">
          <button v-for="i in count" :key="i" type="button" class="h-8 cursor-pointer rounded-lg bg-bg-muted px-3 text-sm text-fg focus-ring" @click="go(i - 1)">{{ i }}</button>
        </div>
      </div>`,
  }),
}
