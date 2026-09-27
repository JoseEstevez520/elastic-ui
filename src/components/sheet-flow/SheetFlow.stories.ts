import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Button from '../button/Button.vue'
import Checkbox from '../checkbox/Checkbox.vue'
import FileIcon from '../file-icon/FileIcon.vue'
import Textarea from '../input/Textarea.vue'
import RadioGroup from '../radio-group/RadioGroup.vue'
import RadioGroupItem from '../radio-group/RadioGroupItem.vue'
import SheetFlow from './SheetFlow.vue'
import SheetFlowStep from './SheetFlowStep.vue'

const parts = { Button, Checkbox, FileIcon, RadioGroup, RadioGroupItem, SheetFlow, SheetFlowStep, Textarea }

const meta = {
  title: 'Overlays/SheetFlow',
  component: SheetFlow,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SheetFlow>
export default meta
type Story = StoryObj<typeof meta>

const handIn = `
  <SheetFlow v-model:step="step" @complete="handedIn = true">
    <template #trigger>Hand in a practice</template>
    <SheetFlowStep title="Which practice?" v-slot="{ next }">
      <RadioGroup v-model="practice" label="Practice">
        <RadioGroupItem value="p1" description="Due Friday">Practice 1, a static site</RadioGroupItem>
        <RadioGroupItem value="p2" description="Due in two weeks">Practice 2, forms</RadioGroupItem>
        <RadioGroupItem value="p3" description="Not open yet" disabled>Practice 3, a small API</RadioGroupItem>
      </RadioGroup>
      <Button class="mt-6 w-full" @click="next">Continue</Button>
    </SheetFlowStep>
    <SheetFlowStep title="Add a note" v-slot="{ next }">
      <p class="text-ui text-fg-secondary">Anything the teacher should know before marking it.</p>
      <Textarea v-model="note" class="mt-3" placeholder="Optional" />
      <Button class="mt-6 w-full" @click="next">Continue</Button>
    </SheetFlowStep>
    <SheetFlowStep title="Hand it in?" v-slot="{ finish }">
      <div class="flex items-center gap-3">
        <FileIcon name="practice-2.zip" />
        <div><p class="text-label text-fg">practice-2.zip</p><p class="text-meta text-fg-muted">2.4 MB</p></div>
      </div>
      <Button class="mt-6 w-full" @click="finish">Hand in</Button>
    </SheetFlowStep>
  </SheetFlow>`

function handInSetup() {
  return { step: ref(0), practice: ref('p2'), note: ref(''), handedIn: ref(false) }
}

/**
 * Press it: the button grows into a sheet as tall as the first step. Continue, and the step fades,
 * the sheet eases to the next one's height and the next one comes in, its title morphing on the bar.
 */
export const Default: Story = {
  render: () => ({
    components: parts,
    setup: handInSetup,
    template: `
      <div class="flex h-screen flex-col items-center justify-center gap-3 p-6">
        ${handIn}
        <p class="text-meta text-fg-muted">{{ handedIn ? 'Handed in.' : 'Not handed in yet.' }}</p>
      </div>`,
  }),
}

// Situations

/** A step taller than the screen: the sheet takes nearly all of it, and the step scrolls under its bar. */
export const LongStep: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ step: ref(0) }),
    template: `
      <div class="flex h-screen items-center justify-center p-6">
        <SheetFlow v-model:step="step">
          <template #trigger>Check before handing in</template>
          <SheetFlowStep title="Before you hand in" v-slot="{ next }">
            <p class="text-ui text-fg-secondary">Go through the list. It is long on purpose.</p>
            <div class="mt-4 flex flex-col gap-3">
              <Checkbox v-for="n in 30" :key="n">Point {{ n }} of the checklist</Checkbox>
            </div>
            <Button class="mt-6 w-full" @click="next">Done</Button>
          </SheetFlowStep>
          <SheetFlowStep title="All set" v-slot="{ finish }">
            <p class="text-ui text-fg-secondary">Nothing is missing.</p>
            <Button class="mt-6 w-full" @click="finish">Close</Button>
          </SheetFlowStep>
        </SheetFlow>
      </div>`,
  }),
}

/** On a phone it is as wide as the screen, less a margin. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: Default.render,
}
