import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Accordion from './Accordion.vue'
import AccordionContent from './AccordionContent.vue'
import AccordionItem from './AccordionItem.vue'
import AccordionTrigger from './AccordionTrigger.vue'

const QUESTIONS = [
  { value: 'model', question: 'What is a model?', answer: 'The brain: it reads what you write and decides what to do next.' },
  { value: 'harness', question: 'What is a harness?', answer: 'The body: it reads files, edits them and runs commands on behalf of the model.' },
  { value: 'agent', question: 'And an agent?', answer: 'Both together, in a loop: look, think, act, check.' },
  { value: 'opencode', question: 'Why OpenCode?', answer: 'It is free, simple and well built.' },
]

interface AccordionArgs {
  type: 'single' | 'multiple'
  /** How many sections to show. */
  items: number
  /** Swaps in answers far longer than usual. */
  longAnswers: boolean
}

const faq = (args: AccordionArgs) => ({
  components: { Accordion, AccordionItem, AccordionTrigger, AccordionContent },
  setup: () => ({
    args,
    items: () => QUESTIONS.slice(0, args.items),
    answer: (text: string) => (args.longAnswers ? Array(5).fill(text).join(' ') : text),
  }),
  template: `
    <Accordion :key="args.type" :type="args.type" class="max-w-lg">
      <AccordionItem v-for="item in items()" :key="item.value" :value="item.value">
        <AccordionTrigger>{{ item.question }}</AccordionTrigger>
        <AccordionContent>{{ answer(item.answer) }}</AccordionContent>
      </AccordionItem>
    </Accordion>`,
})

const meta = {
  title: 'Base/Accordion',
  // Top-aligned: centering would re-center the list as sections open.
  args: { type: 'single', items: QUESTIONS.length, longAnswers: false },
  argTypes: {
    type: { control: 'inline-radio', options: ['single', 'multiple'] },
    items: { control: { type: 'range', min: 1, max: QUESTIONS.length, step: 1 } },
  },
  render: (args) => faq(args),
} satisfies Meta<AccordionArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {}

export const Multiple: Story = {
  args: { type: 'multiple' },
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

export const LongAnswers: Story = {
  args: { longAnswers: true },
}

export const SingleItem: Story = {
  args: { items: 1 },
}
