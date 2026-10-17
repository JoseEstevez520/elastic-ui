import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Field from '../field/Field.vue'
import TagsInput from './TagsInput.vue'

const meta = {
  title: 'Forms/TagsInput',
  component: TagsInput,
  render: (args) => ({
    components: { TagsInput },
    setup: () => ({ args, tags: ref(['vue', 'tailwind']) }),
    template: `<TagsInput v-bind="args" v-model="tags" placeholder="Add a tag" class="w-80" />`,
  }),
} satisfies Meta<typeof TagsInput>

export default meta
type Story = StoryObj<typeof meta>

/** Type and press Enter or a comma: the text becomes its tag where it stands. */
export const Default: Story = {}

export const InField: Story = {
  render: () => ({
    components: { Field, TagsInput },
    setup: () => ({ tags: ref<string[]>([]) }),
    template: `
      <Field label="Keywords" description="Press Enter after each one." class="w-80">
        <TagsInput v-model="tags" placeholder="linux, apache…" />
      </Field>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** More tags than fit on a line: they wrap, the field growing with them. */
export const Many: Story = {
  render: () => ({
    components: { TagsInput },
    setup: () => ({
      tags: ref(['html', 'css', 'javascript', 'vue', 'tailwind', 'node', 'express', 'postgres', 'docker']),
    }),
    template: `<TagsInput v-model="tags" class="w-80" />`,
  }),
}

export const AtTheMax: Story = {
  render: () => ({
    components: { TagsInput },
    setup: () => ({ tags: ref(['one', 'two', 'three']) }),
    template: `<TagsInput v-model="tags" :max="3" class="w-80" />`,
  }),
}

export const Invalid: Story = { args: { invalid: true } }

export const Disabled: Story = { args: { disabled: true } }
