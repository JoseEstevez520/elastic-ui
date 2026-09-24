import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CodeBlock from './CodeBlock.vue'

const COMPONENT = `<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button @click="count++">Clicked {{ count }} times</button>
</template>
`

const LONG = `docker run --rm -it -p 8080:80 -v "$(pwd)/html:/usr/share/nginx/html:ro" --name apuntes-web nginx:alpine`

const meta = {
  title: 'Base/CodeBlock',
  component: CodeBlock,
  args: { code: COMPONENT, title: 'Counter.vue' },
  render: (args) => ({
    components: { CodeBlock },
    setup: () => ({ args }),
    template: `<CodeBlock v-bind="args" class="max-w-xl" />`,
  }),
} satisfies Meta<typeof CodeBlock>

export default meta
type Story = StoryObj<typeof meta>

/** Named by its file, with the copy button on the caption; copying turns it into a check. */
export const Default: Story = {}

/** Only a language: it names the block instead. */
export const Language: Story = { args: { code: 'npm install elastic-ui', title: undefined, language: 'bash' } }

/** A bare snippet: nothing on it at rest; the copy button comes with the pointer or the focus. */
export const Bare: Story = { args: { code: 'git switch -c feature/toc', title: undefined } }

/** A line longer than the block scrolls sideways, fading at the side that has more. */
export const LongLine: Story = { args: { code: LONG, title: undefined, language: 'bash' } }
