import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Card from '../card/Card.vue'
import CardContent from '../card/CardContent.vue'
import CardHeader from '../card/CardHeader.vue'
import CardTitle from '../card/CardTitle.vue'
import Table from './Table.vue'
import TableBody from './TableBody.vue'
import TableCaption from './TableCaption.vue'
import TableCell from './TableCell.vue'
import TableHead from './TableHead.vue'
import TableHeader from './TableHeader.vue'
import TableRow from './TableRow.vue'

const meta = { title: 'Content/Table', component: Table, parameters: { layout: 'padded' } } satisfies Meta<typeof Table>
export default meta
type Story = StoryObj<typeof meta>

const parts = {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
}
const grades = [
  { module: 'Web client', practice: 8.5, exam: 7.25, final: 7.8 },
  { module: 'Web server', practice: 9, exam: 6.5, final: 7.6 },
  { module: 'Deployment', practice: 7, exam: 8, final: 7.55 },
  { module: 'Design', practice: 10, exam: 9.5, final: 9.7 },
]
const table = `
  <Table>
    <TableCaption>Grades so far, out of ten.</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Module</TableHead>
        <TableHead numeric>Practice</TableHead>
        <TableHead numeric>Exam</TableHead>
        <TableHead numeric>Final</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="g in grades" :key="g.module" :interactive="interactive">
        <TableCell class="text-label">{{ g.module }}</TableCell>
        <TableCell numeric class="text-fg-secondary">{{ g.practice.toFixed(2) }}</TableCell>
        <TableCell numeric class="text-fg-secondary">{{ g.exam.toFixed(2) }}</TableCell>
        <TableCell numeric>{{ g.final.toFixed(2) }}</TableCell>
      </TableRow>
    </TableBody>
  </Table>`

/** Grades: no box, rows parted by hairlines, the figures lined up on the right. */
export const Grades: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ grades, interactive: false }),
    template: `<div class="max-w-xl">${table}</div>`,
  }),
}

/** Rows that open their item take the surface tone under the pointer. */
export const InteractiveRows: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ grades, interactive: true }),
    template: `<div class="max-w-xl">${table}</div>`,
  }),
}

/** Inside a Card, the table keeps to the card's padding and needs no box of its own. */
export const InACard: Story = {
  render: () => ({
    components: parts,
    setup: () => ({ grades, interactive: false }),
    template: `
      <Card class="max-w-xl">
        <CardHeader><CardTitle>Second term</CardTitle></CardHeader>
        <CardContent>${table}</CardContent>
      </Card>`,
  }),
}

/** Many columns on a phone: it scrolls sideways, fading at the side that has more. */
export const ManyColumns: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => ({
    components: parts,
    setup: () => ({
      weeks: Array.from({ length: 10 }, (_, i) => i + 1),
      students: ['Ada', 'Grace', 'Alan', 'Linus', 'Margaret'],
    }),
    template: `
      <div class="max-w-sm">
        <Table>
          <TableCaption>Attendance per week, in hours.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead v-for="w in weeks" :key="w" numeric>Week {{ w }}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="(s, i) in students" :key="s">
              <TableCell class="text-label">{{ s }}</TableCell>
              <TableCell v-for="w in weeks" :key="w" numeric>{{ 20 - ((i * 3 + w) % 5) }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>`,
  }),
}
