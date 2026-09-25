import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import Button from '../button/Button.vue'
import Input from '../input/Input.vue'
import Textarea from '../input/Textarea.vue'
import RadioGroup from '../radio-group/RadioGroup.vue'
import RadioGroupItem from '../radio-group/RadioGroupItem.vue'
import Select from '../select/Select.vue'
import SelectContent from '../select/SelectContent.vue'
import SelectItem from '../select/SelectItem.vue'
import SelectTrigger from '../select/SelectTrigger.vue'
import SelectValue from '../select/SelectValue.vue'
import Field from './Field.vue'

const meta = {
  title: 'Forms/Field',
  component: Field,
  args: { label: 'Email' },
  render: () => ({
    components: { Button, Field, Input, RadioGroup, RadioGroupItem, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea },
    setup() {
      const email = ref('')
      const tried = ref(false)
      const emailError = computed(() =>
        tried.value && !/^\S+@\S+\.\S+$/.test(email.value) ? 'Write an email such as name@example.com.' : undefined,
      )
      return { email, tried, emailError, module: ref<string>(), kind: ref('practice'), notes: ref('') }
    },
    template: `
      <form class="flex max-w-sm flex-col gap-5" novalidate @submit.prevent="tried = true">
        <Field label="Email" description="Where the grade is sent." :error="emailError">
          <Input v-model="email" type="email" placeholder="name@example.com" />
        </Field>
        <Field label="Module">
          <Select v-model="module">
            <SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="client">Web client</SelectItem>
              <SelectItem value="server">Web server</SelectItem>
              <SelectItem value="design">Interface design</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="What it is">
          <RadioGroup v-model="kind">
            <RadioGroupItem value="practice" description="Graded, with a deadline.">A practice</RadioGroupItem>
            <RadioGroupItem value="exercise">An exercise</RadioGroupItem>
            <RadioGroupItem value="question">A question</RadioGroupItem>
          </RadioGroup>
        </Field>
        <Field label="Notes" optional>
          <Textarea v-model="notes" placeholder="Anything the teacher should know" />
        </Field>
        <Button type="submit" class="self-start">Hand in</Button>
      </form>`,
  }),
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A form: each control with its label above and its help below, linked to them on their own. Hand
 * it in with a wrong email: the error comes into focus where the help was, and the field turns red.
 */
export const Default: Story = {}
