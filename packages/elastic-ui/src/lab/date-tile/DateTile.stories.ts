import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import Button from '../../components/button/Button.vue'
import DateTile from './DateTile.vue'

/** Lab: a date as a tear-off calendar; moving on, the day's page lifts over the binding. */
const meta = { title: 'Lab/Date tile', parameters: { layout: 'centered' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const shift = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Step through the days: forward the page lifts away, back it comes down again; a new month morphs. */
export const Days: Story = {
  render: () => ({
    components: { DateTile, Button, ChevronLeft, ChevronRight },
    setup() {
      const date = ref('2026-09-29')
      return { date, move: (n: number) => (date.value = shift(date.value, n)) }
    },
    template: `
      <div class="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Previous day" @click="move(-1)"><ChevronLeft class="size-4" /></Button>
        <DateTile :date="date" />
        <Button variant="ghost" size="icon" aria-label="Next day" @click="move(1)"><ChevronRight class="size-4" /></Button>
      </div>`,
  }),
}

/** Where it lives: the date of each thing due, in a list. */
export const InAList: Story = {
  render: () => ({
    components: { DateTile },
    template: `
      <ul class="w-80 space-y-3">
        <li class="flex items-center gap-3"><DateTile date="2026-09-29" /><div><p class="text-label text-fg">Hand in practice 2</p><p class="text-meta text-fg-muted">Web server</p></div></li>
        <li class="flex items-center gap-3"><DateTile date="2026-10-02" /><div><p class="text-label text-fg">Networks exam</p><p class="text-meta text-fg-muted">Room 204</p></div></li>
      </ul>`,
  }),
}
