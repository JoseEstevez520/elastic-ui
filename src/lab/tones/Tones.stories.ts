import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { onBeforeUnmount, onMounted } from 'vue'
import Button from '../../components/button/Button.vue'
import DialogMorph from '../../components/dialog-morph/DialogMorph.vue'
import DialogMorphClose from '../../components/dialog-morph/DialogMorphClose.vue'
import DialogMorphDescription from '../../components/dialog-morph/DialogMorphDescription.vue'
import DialogMorphTitle from '../../components/dialog-morph/DialogMorphTitle.vue'
import PopoverMorph from '../../components/popover-morph/PopoverMorph.vue'
import PopoverMorphItem from '../../components/popover-morph/PopoverMorphItem.vue'
import Select from '../../components/select/Select.vue'
import SelectContent from '../../components/select/SelectContent.vue'
import SelectItem from '../../components/select/SelectItem.vue'
import SelectTrigger from '../../components/select/SelectTrigger.vue'
import SelectValue from '../../components/select/SelectValue.vue'
import Toaster from '../../components/toast/Toaster.vue'
import { toast } from '../../components/toast/toast.store'
import './tones.css'

/**
 * Lab: the same parts, as they are ("Now") and drawn with tones instead of shadows ("Tones"): a
 * floating panel stands a tone above the page with a hairline round it, and casts no shadow. Open
 * each in both to compare.
 */
const meta = { title: 'Lab/Tones', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const parts = {
  Button,
  DialogMorph,
  DialogMorphClose,
  DialogMorphDescription,
  DialogMorphTitle,
  PopoverMorph,
  PopoverMorphItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Toaster,
}
const template = `
  <div class="flex flex-wrap items-start gap-4">
    <Select class="w-48">
      <SelectTrigger><SelectValue placeholder="Pick a module" /></SelectTrigger>
      <SelectContent>
        <SelectItem v-for="m in ['Web client', 'Web server', 'Deployment', 'Design']" :key="m" :value="m">{{ m }}</SelectItem>
      </SelectContent>
    </Select>
    <PopoverMorph role="menu" label="Actions">
      <template #trigger>Actions</template>
      <PopoverMorphItem>Rename</PopoverMorphItem>
      <PopoverMorphItem>Duplicate</PopoverMorphItem>
      <PopoverMorphItem>Move to…</PopoverMorphItem>
    </PopoverMorph>
    <DialogMorph>
      <template #trigger>Publish</template>
      <DialogMorphTitle>Publish these notes?</DialogMorphTitle>
      <DialogMorphDescription>Everyone in the class will see them.</DialogMorphDescription>
      <div class="mt-6 flex justify-end gap-2">
        <DialogMorphClose as-child><Button variant="ghost">Cancel</Button></DialogMorphClose>
        <DialogMorphClose as-child><Button>Publish</Button></DialogMorphClose>
      </div>
    </DialogMorph>
    <Button variant="outline" @click="toast({ title: 'Notes saved', description: 'Unit 3, networks.' })">Show a toast</Button>
    <Toaster />
  </div>`

/** As the library draws them today: panels on the page's colour, lifted by a soft shadow. */
export const Now: Story = {
  render: () => ({ components: parts, setup: () => ({ toast }), template }),
}

/** With tones: panels a tone above the page, a hairline round them, no shadow. */
export const Tones: Story = {
  render: () => ({
    components: parts,
    setup() {
      onMounted(() => document.documentElement.classList.add('lab-tones'))
      onBeforeUnmount(() => document.documentElement.classList.remove('lab-tones'))
      return { toast }
    },
    template,
  }),
}
