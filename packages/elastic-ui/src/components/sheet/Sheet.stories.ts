import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Button from '../button/Button.vue'
import DialogMorphClose from '../dialog-morph/DialogMorphClose.vue'
import DialogMorphDescription from '../dialog-morph/DialogMorphDescription.vue'
import DialogMorphTitle from '../dialog-morph/DialogMorphTitle.vue'
import Field from '../field/Field.vue'
import Input from '../input/Input.vue'
import Select from '../select/Select.vue'
import SelectContent from '../select/SelectContent.vue'
import SelectItem from '../select/SelectItem.vue'
import SelectTrigger from '../select/SelectTrigger.vue'
import SelectValue from '../select/SelectValue.vue'
import Switch from '../switch/Switch.vue'
import Sheet from './Sheet.vue'

const parts = {
  Button,
  Field,
  Input,
  Sheet,
  SheetClose: DialogMorphClose,
  SheetDescription: DialogMorphDescription,
  SheetTitle: DialogMorphTitle,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
}

const settings = `
  <SheetTitle>Settings</SheetTitle>
  <SheetDescription>How the site looks and what it tells you.</SheetDescription>
  <div class="mt-6 flex flex-col gap-5">
    <Field label="Display name"><Input model-value="José" /></Field>
    <Switch :model-value="true">Email me when a task is marked</Switch>
    <Switch>Show finished tasks</Switch>
  </div>
  <div class="mt-8 flex justify-end gap-2">
    <SheetClose as-child><Button variant="ghost">Cancel</Button></SheetClose>
    <SheetClose as-child><Button>Save</Button></SheetClose>
  </div>`

const meta = {
  title: 'Overlays/Sheet',
  component: Sheet,
  parameters: { layout: 'fullscreen' },
  render: (args) => ({
    components: parts,
    setup: () => ({ args }),
    template: `
      <div class="flex h-screen items-start justify-end p-6">
        <Sheet v-bind="args"><template #trigger>Settings</template>${settings}</Sheet>
      </div>`,
  }),
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

/** Its button's box travels to the right edge and grows into the sheet, and folds back into it. */
export const Default: Story = {}

export const Left: Story = {
  args: { side: 'left' },
  render: (args) => ({
    components: parts,
    setup: () => ({ args }),
    template: `<div class="p-6"><Sheet v-bind="args"><template #trigger>Settings</template>${settings}</Sheet></div>`,
  }),
}

/** From the bottom, as on a phone. */
export const Bottom: Story = {
  args: { side: 'bottom' },
  render: (args) => ({
    components: parts,
    setup: () => ({ args }),
    template: `<div class="flex h-screen items-end justify-center p-6"><Sheet v-bind="args"><template #trigger>Settings</template>${settings}</Sheet></div>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** More than fits: only the content scrolls, once the sheet has landed. */
export const LongContent: Story = {
  render: () => ({
    components: parts,
    template: `
      <div class="p-6">
        <Sheet>
          <template #trigger>Changelog</template>
          <SheetTitle>What changed</SheetTitle>
          <p v-for="n in 40" :key="n" class="mt-3 text-sm text-fg-secondary">Version 0.{{ n }}: small fixes and a new part.</p>
        </Sheet>
      </div>`,
  }),
}

/**
 * A long list at the sheet's foot: the content gets the room to scroll to the open list, and
 * scrolls it into view; the list scrolls in its own bounds.
 */
export const FieldsThatOpen: Story = {
  args: { side: 'bottom' },
  render: (args) => ({
    components: parts,
    setup: () => ({ args, icon: ref('icon-1'), icons: Array.from({ length: 40 }, (_, i) => `icon-${i + 1}`) }),
    template: `
      <div class="flex h-screen items-end justify-center p-6">
        <Sheet v-bind="args">
          <template #trigger>Edit section</template>
          <SheetTitle>Edit section</SheetTitle>
          <div class="mt-6 flex flex-col gap-5">
            <Field label="Title"><Input model-value="Unit 1" /></Field>
            <Field label="Icon">
              <Select v-model="icon">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="name in icons" :key="name" :value="name">{{ name }}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Sheet>
      </div>`,
  }),
}

/** Opened from code, with v-model:open. */
export const Controlled: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ open: ref(false) }),
    template: `
      <div class="flex gap-3 p-6">
        <Sheet v-model:open="open"><template #trigger>Settings</template>${settings}</Sheet>
        <Button variant="ghost" @click="open = true">Open it from here</Button>
      </div>`,
  }),
}
