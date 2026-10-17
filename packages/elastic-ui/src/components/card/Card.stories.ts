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
  title: 'Content/Card',
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
        <CardImage :src="IMAGE" alt="Laptop with code" fade class="aspect-video" />
        <CardHeader>
          <CardTitle>With an image</CardTitle>
          <CardDescription>The image sits flush and its bottom edge fades into the card.</CardDescription>
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

const REFERENCES = [
  { title: 'Refactoring UI', text: 'The book behind the type scale and the greys.', href: 'https://www.refactoringui.com', image: IMAGE },
  { title: 'Every Layout', text: 'Layouts measured from their content, not from breakpoints.', href: 'https://every-layout.dev' },
  { title: 'Inventing on Principle', text: 'Bret Victor on seeing what you make as you make it.', href: 'https://vimeo.com/906418692' },
]

/**
 * A reference: the whole card is the link, with an optional image, a title and a line. To another
 * site it opens in a new tab, its title carrying the outward arrow; it takes a tone up under the
 * pointer and the focus ring from the keyboard.
 */
export const Link: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args, refs: REFERENCES }),
    template: `
      <div class="grid max-w-2xl gap-4 sm:grid-cols-2">
        <Card v-for="r in refs" :key="r.title" v-bind="args" size="sm" :href="r.href" class="h-full">
          <CardImage v-if="r.image" :src="r.image" :alt="r.title" fade class="aspect-video" />
          <CardHeader class="gap-1">
            <CardTitle>{{ r.title }}</CardTitle>
            <CardDescription>{{ r.text }}</CardDescription>
          </CardHeader>
        </Card>
        <Card v-bind="args" size="sm" href="#getting-started" class="h-full">
          <CardHeader class="gap-1">
            <CardTitle>Getting started</CardTitle>
            <CardDescription>A page of this site: no arrow, the same tab.</CardDescription>
          </CardHeader>
        </Card>
      </div>`,
  }),
}
