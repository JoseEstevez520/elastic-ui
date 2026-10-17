import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { BookOpen, FileCode, Link } from '@lucide/vue'
import Card from '../card/Card.vue'
import CardDescription from '../card/CardDescription.vue'
import CardHeader from '../card/CardHeader.vue'
import CardTitle from '../card/CardTitle.vue'
import Gallery from './Gallery.vue'
import GalleryItem from './GalleryItem.vue'

const meta = { title: 'Content/Gallery', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const projects = [
  { id: 1, name: 'Curio', kind: 'Web', year: '2025', photo: 1043 },
  { id: 2, name: 'SkillNet', kind: 'Web', year: '2024', photo: 1036 },
  { id: 3, name: 'Maneva', kind: 'Mobile', year: '2024', photo: 1080 },
  { id: 4, name: 'Micafold', kind: 'Web', year: '2023', photo: 1015 },
  { id: 5, name: 'Study buddy', kind: 'AI', year: '2025', photo: 1039 },
  { id: 6, name: 'Timetable', kind: 'Mobile', year: '2023', photo: 1025 },
  { id: 7, name: 'Notes to quiz', kind: 'AI', year: '2026', photo: 1050 },
]

/**
 * A portfolio: choose a category and what does not belong fades out, then the rest slide to their
 * new cells, then what comes back comes into focus there.
 */
export const Projects: Story = {
  render: () => ({
    components: { Gallery, GalleryItem },
    setup: () => ({ projects }),
    template: `
      <div class="mx-auto max-w-3xl">
        <Gallery :items="projects" :category-of="(p) => p.kind" :item-key="(p) => p.id" label="Kinds of project">
          <template #default="{ item }">
            <GalleryItem :src="'https://picsum.photos/id/' + item.photo + '/800/600'" :alt="item.name" :title="item.name" :meta="item.kind + ' · ' + item.year" />
          </template>
        </Gallery>
      </div>`,
  }),
}

/** Photos that open where they are (`zoom`, ImageView), filtered by place. */
export const Photos: Story = {
  render: () => ({
    components: { Gallery, GalleryItem },
    setup: () => ({
      photos: projects.map((p, i) => ({ ...p, place: ['Mountains', 'City', 'Coast'][i % 3] })),
    }),
    template: `
      <div class="mx-auto max-w-3xl">
        <Gallery :items="photos" :category-of="(p) => p.place" :categories="['Mountains', 'City', 'Coast']" :item-key="(p) => p.id" label="Places">
          <template #default="{ item }">
            <GalleryItem zoom :src="'https://picsum.photos/id/' + item.photo + '/1200/900'" :alt="item.name" :title="item.name" />
          </template>
        </Gallery>
      </div>`,
  }),
}

const work = [
  { id: 1, title: 'Practice 2: a REST API', module: 'Web server', kind: 'Practice', due: 'Due 3 Oct' },
  { id: 2, title: 'Routing, step by step', module: 'Web server', kind: 'Notes', due: '12 min read' },
  { id: 3, title: 'Practice 1: a static site', module: 'Web client', kind: 'Practice', due: 'Handed in' },
  { id: 4, title: 'Flexbox and grid', module: 'Web client', kind: 'Notes', due: '8 min read' },
  { id: 5, title: 'MDN: the fetch API', module: 'Web client', kind: 'Resource', due: 'developer.mozilla.org' },
  { id: 6, title: 'Docker, the basics', module: 'Deployment', kind: 'Notes', due: '15 min read' },
  { id: 7, title: 'Practice 3: deploy it', module: 'Deployment', kind: 'Practice', due: 'Due 20 Oct' },
  { id: 8, title: 'The twelve-factor app', module: 'Deployment', kind: 'Resource', due: '12factor.net' },
]
const kindIcons = { Practice: FileCode, Notes: BookOpen, Resource: Link }

/**
 * A class web: practices, notes and resources as Cards, narrowed by module and by kind at once.
 * Narrowed to nothing, Empty says so.
 */
export const ClassWork: Story = {
  render: () => ({
    components: { Gallery, Card, CardHeader, CardTitle, CardDescription },
    setup: () => ({
      work,
      kindIcons,
      facets: [
        { name: 'module', label: 'Module', of: (w: (typeof work)[number]) => w.module },
        { name: 'kind', label: 'Kind', of: (w: (typeof work)[number]) => w.kind },
      ],
    }),
    template: `
      <div class="mx-auto max-w-4xl">
        <Gallery :items="work" :facets="facets" :item-key="(w) => w.id" empty-label="Nothing of this kind in this module yet">
          <template #default="{ item }">
            <Card size="sm" class="h-full">
              <CardHeader>
                <component :is="kindIcons[item.kind]" class="mb-2 size-4 text-fg-muted" aria-hidden="true" />
                <CardTitle>{{ item.title }}</CardTitle>
                <CardDescription>{{ item.module }} · {{ item.due }}</CardDescription>
              </CardHeader>
            </Card>
          </template>
        </Gallery>
      </div>`,
  }),
}
