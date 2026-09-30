import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Pause, Phone, PhoneOff, Play, SkipForward, Timer, Upload } from '@lucide/vue'
import { computed, onBeforeUnmount, ref } from 'vue'
import Button from '../button/Button.vue'
import TextMorph from '../text-morph/TextMorph.vue'
import DynamicIsland from './DynamicIsland.vue'

// The library ships no icons; Lucide stands in for a project's own.
const icons = { Pause, Phone, PhoneOff, Play, SkipForward, Timer, Upload }

const meta = {
  title: 'Content/DynamicIsland',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { Button, DynamicIsland, TextMorph },
    setup() {
      const state = ref('idle')
      const playing = ref(true)

      // A timer and an upload that tick, so their text morphs while their shape holds still.
      const seconds = ref(90)
      const progress = ref(0)
      const tick = setInterval(() => {
        if (state.value === 'timer' && seconds.value > 0) seconds.value--
        if (state.value === 'upload') progress.value = Math.min(100, progress.value + 7)
        if (state.value === 'upload' && progress.value === 100) setTimeout(() => (state.value = 'done'), 600)
      }, 1000)
      onBeforeUnmount(() => clearInterval(tick))

      const clock = computed(() => `${Math.floor(seconds.value / 60)}:${String(seconds.value % 60).padStart(2, '0')}`)
      const show = (next: string) => {
        if (next === 'upload') progress.value = 0
        if (next === 'timer') seconds.value = 90
        state.value = next
      }
      return { state, playing, clock, progress, show, icons }
    },
    template: `
      <div class="min-h-screen">
        <DynamicIsland
          floating
          :state="state"
          :class="(state === 'music' || state === 'player') && 'cursor-pointer'"
          @click="state === 'music' ? show('player') : state === 'player' && show('music')"
        >
          <div v-if="state === 'idle'" class="h-8 w-28" />

          <div v-else-if="state === 'music'" class="flex h-8 items-center gap-3 px-2">
            <span class="size-5 rounded-md bg-gradient-to-br from-fuchsia-500 to-amber-400" />
            <span class="w-28" />
            <span class="flex h-3 items-end gap-0.5" aria-hidden="true">
              <span v-for="n in 4" :key="n" class="w-0.5 rounded-full bg-current" :style="{ height: 4 + (n % 3) * 3 + 'px' }" />
            </span>
          </div>

          <div v-else-if="state === 'player'" class="flex w-80 flex-col gap-4 p-5">
            <div class="flex items-center gap-3">
              <span class="size-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-amber-400" />
              <div class="min-w-0">
                <p class="text-sm font-medium">Midnight City</p>
                <p class="text-sm opacity-60">M83</p>
              </div>
            </div>
            <div class="flex items-center justify-center gap-6">
              <button type="button" class="cursor-pointer" :aria-label="playing ? 'Pause' : 'Play'" @click.stop="playing = !playing">
                <component :is="playing ? icons.Pause : icons.Play" class="size-6" />
              </button>
              <button type="button" class="cursor-pointer" aria-label="Next" @click.stop><component :is="icons.SkipForward" class="size-6" /></button>
            </div>
          </div>

          <div v-else-if="state === 'timer'" class="flex h-8 items-center gap-2 px-3 text-sm font-medium tabular-nums">
            <component :is="icons.Timer" class="size-4 text-amber-400" />
            <TextMorph :text="clock" />
          </div>

          <div v-else-if="state === 'upload'" class="flex h-8 items-center gap-2 px-3 text-sm">
            <component :is="icons.Upload" class="size-4 text-sky-400" />
            <span>Uploading</span>
            <TextMorph class="tabular-nums opacity-60" :text="progress + '%'" />
          </div>

          <div v-else-if="state === 'done'" class="flex h-8 items-center gap-2 px-3 text-sm">
            <span class="size-2 rounded-full bg-emerald-400" />
            Uploaded
          </div>

          <div v-else-if="state === 'call'" class="flex w-72 items-center justify-between gap-3 p-3">
            <div class="flex items-center gap-3">
              <span class="flex size-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <component :is="icons.Phone" class="size-5" />
              </span>
              <div>
                <p class="text-sm font-medium">Ada Lovelace</p>
                <p class="text-xs opacity-60">Incoming call</p>
              </div>
            </div>
            <button type="button" class="flex size-10 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white" aria-label="Decline" @click="show('idle')">
              <component :is="icons.PhoneOff" class="size-5" />
            </button>
          </div>
        </DynamicIsland>

        <div class="flex flex-wrap justify-center gap-2 px-4 pt-40">
          <Button v-for="s in ['idle', 'music', 'timer', 'upload', 'call']" :key="s" size="sm" :variant="state === s ? 'solid' : 'outline'" @click="show(s)">
            {{ s }}
          </Button>
        </div>
        <p class="pt-4 text-center text-sm text-fg-muted">Tap the island while music plays to open the player, and again to fold it back.</p>
      </div>`,
  }),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Each state has its own size and shape; changing state morphs the island into it. */
export const Default: Story = {}
