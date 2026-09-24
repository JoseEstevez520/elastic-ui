import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Button } from '../button'
import Card from './Card.vue'
import CardContent from './CardContent.vue'
import CardDescription from './CardDescription.vue'
import CardFooter from './CardFooter.vue'
import CardHeader from './CardHeader.vue'
import CardImage from './CardImage.vue'
import CardTitle from './CardTitle.vue'

const parts = { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardImage, Button }
const IMAGE = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80'

const meta = {
  title: 'Base/Card',
  component: Card,
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'outline', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  args: { variant: 'default', size: 'md' },
  render: (args) => ({
    components: parts,
    setup: () => ({ args }),
    template: `
      <Card v-bind="args" class="w-80">
        <CardHeader>
          <CardTitle>Curio</CardTitle>
          <CardDescription>A learning app that turns notes into quizzes.</CardDescription>
        </CardHeader>
        <CardContent>Built with Vue, Tailwind and a small Node API.</CardContent>
        <CardFooter>
          <Button size="sm">Open</Button>
          <Button size="sm" variant="ghost">Source</Button>
        </CardFooter>
      </Card>`,
  }),
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithImage: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args, IMAGE }),
    template: `
      <Card v-bind="args" class="w-80">
        <CardImage :src="IMAGE" alt="Laptop with code" class="aspect-video" />
        <CardHeader>
          <CardTitle>With an image</CardTitle>
          <CardDescription>The image sits flush because it is the first part.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button size="sm" class="w-full">View project</Button>
        </CardFooter>
      </Card>`,
  }),
}

/** Any markup can go between the parts; the parts only handle spacing and typography. */
export const FreeComposition: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args }),
    template: `
      <Card v-bind="args" class="w-80">
        <CardHeader class="flex-row items-center gap-3">
          <span class="grid size-9 place-items-center rounded-full bg-accent-subtle font-semibold text-accent">M</span>
          <div>
            <CardTitle>Maneva</CardTitle>
            <CardDescription>Custom header layout</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ul class="flex flex-wrap gap-2">
            <li v-for="tag in ['Vue', 'Tailwind', 'Node']" :key="tag" class="rounded-md border border-border px-2 py-0.5 text-xs">{{ tag }}</li>
          </ul>
        </CardContent>
      </Card>`,
  }),
}
