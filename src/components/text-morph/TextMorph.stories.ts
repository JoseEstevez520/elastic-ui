import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Check, Save, UserPlus } from '@lucide/vue'
import { computed, ref } from 'vue'
import Button from '../button/Button.vue'
import TextMorph from './TextMorph.vue'

const meta = {
  title: 'Base/TextMorph',
  render: () => ({
    components: { Button, TextMorph },
    setup() {
      const saved = ref(false)
      return { saved, icons: { Check, Save } }
    },
    template: `
      <Button :icon="saved ? icons.Check : icons.Save" variant="outline" @click="saved = !saved">
        <TextMorph :text="saved ? 'Saved' : 'Save'" />
      </Button>`,
  }),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** "Save" to "Saved": the letters they share stay, the new ones come into focus at the end. */
export const Default: Story = {}

/** Words that share letters in other places: each letter slides to its new spot. */
export const Rearrange: Story = {
  render: () => ({
    components: { Button, TextMorph },
    setup() {
      const words = ['Follow', 'Following', 'Unfollow']
      const i = ref(0)
      return { word: computed(() => words[i.value % words.length]!), next: () => i.value++, icons: { UserPlus } }
    },
    template: `
      <Button :icon="icons.UserPlus" @click="next"><TextMorph :text="word" /></Button>`,
  }),
}

/** In running text, the sentence around it moves along as its width changes. */
export const InText: Story = {
  render: () => ({
    components: { Button, TextMorph },
    setup() {
      const states = ['draft', 'in review', 'published']
      const i = ref(0)
      return { state: computed(() => states[i.value % states.length]!), next: () => i.value++ }
    },
    template: `
      <div class="flex flex-col items-start gap-3">
        <p class="text-fg">This page is <TextMorph class="font-medium" :text="state" /> and visible to the team.</p>
        <Button size="sm" variant="ghost" @click="next">Next state</Button>
      </div>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** Text with nothing in common swaps whole: out blurring, in coming into focus. */
export const NothingShared: Story = {
  render: () => ({
    components: { Button, TextMorph },
    setup() {
      const on = ref(false)
      return { on }
    },
    template: `<Button variant="outline" @click="on = !on"><TextMorph :text="on ? 'Stop' : 'Record'" /></Button>`,
  }),
}

/** A longer phrase in another language: the width change is larger, but still smooth. */
export const LongText: Story = {
  render: () => ({
    components: { Button, TextMorph },
    setup() {
      const on = ref(false)
      return { on }
    },
    template: `<Button variant="outline" @click="on = !on"><TextMorph :text="on ? 'Cambios guardados correctamente' : 'Guardar cambios'" /></Button>`,
  }),
}
