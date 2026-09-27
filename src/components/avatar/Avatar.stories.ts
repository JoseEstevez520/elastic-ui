import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Avatar from './Avatar.vue'
import AvatarGroup from './AvatarGroup.vue'

const photo = (id: number) => `https://picsum.photos/id/${id}/160/160`
const people = [
  { name: 'Lucía Pardo', src: photo(64) },
  { name: 'Marco Ruiz', src: photo(91) },
  { name: 'Nora Vidal', src: photo(1011) },
  { name: 'Iván Soto' },
  { name: 'Clara Gil', src: photo(1027) },
  { name: 'Hugo Lema', src: photo(1005) },
  { name: 'Sara Otero' },
]

const meta = {
  title: 'Content/Avatar',
  component: Avatar,
  args: { src: photo(64), name: 'Lucía Pardo' },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** With no photo, a person drawn on the surface tone: never initials. */
export const NoPhoto: Story = { args: { src: undefined, name: 'Iván Soto' } }

/** A photo that fails to load gives way to the person, fading in. */
export const BrokenPhoto: Story = { args: { src: 'https://example.invalid/missing.jpg', name: 'Marco Ruiz' } }

export const Sizes: Story = {
  render: () => ({
    components: { Avatar },
    setup: () => ({ people }),
    template: `
      <div class="flex items-center gap-3">
        <Avatar v-for="size in ['sm', 'md', 'lg']" :key="size" :size="size" :src="people[0].src" :name="people[0].name" />
        <Avatar v-for="size in ['sm', 'md', 'lg']" :key="'none-' + size" :size="size" name="Iván Soto" />
      </div>`,
  }),
}

/** Overlapping, with no ring round each; hover or tab into it and the row opens out, names on tooltips. */
export const Group: Story = {
  render: () => ({
    components: { Avatar, AvatarGroup },
    setup: () => ({ people }),
    template: `
      <AvatarGroup :max="5">
        <Avatar v-for="p in people" :key="p.name" :src="p.src" :name="p.name" />
      </AvatarGroup>`,
  }),
}

/** Where it lives: beside what they share, small. */
export const InARow: Story = {
  render: () => ({
    components: { Avatar, AvatarGroup },
    setup: () => ({ people }),
    template: `
      <div class="flex w-96 items-center justify-between">
        <div>
          <p class="text-label text-fg">Practice 2, networks</p>
          <p class="text-meta text-fg-muted">Handed in by 7 of 24</p>
        </div>
        <AvatarGroup :max="3" size="sm">
          <Avatar v-for="p in people" :key="p.name" :src="p.src" :name="p.name" />
        </AvatarGroup>
      </div>`,
  }),
}
