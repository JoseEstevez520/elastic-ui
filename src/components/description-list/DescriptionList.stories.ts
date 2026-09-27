import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Badge from '../badge/Badge.vue'
import Button from '../button/Button.vue'
import Card from '../card/Card.vue'
import CardContent from '../card/CardContent.vue'
import CardHeader from '../card/CardHeader.vue'
import CardTitle from '../card/CardTitle.vue'
import CopyButton from '../copy-button/CopyButton.vue'
import DescriptionItem from './DescriptionItem.vue'
import DescriptionList from './DescriptionList.vue'

const meta = {
  title: 'Content/DescriptionList',
  component: DescriptionList,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DescriptionList>
export default meta
type Story = StoryObj<typeof meta>

const parts = { Badge, Button, Card, CardContent, CardHeader, CardTitle, CopyButton, DescriptionItem, DescriptionList }

/** A student's record: quiet key → value pairs, a value holding whatever it needs to. */
export const AStudentRecord: Story = {
  render: () => ({
    components: parts,
    template: `
      <Card class="max-w-lg">
        <CardHeader><CardTitle>Ada Lovelace</CardTitle></CardHeader>
        <CardContent>
          <DescriptionList>
            <DescriptionItem term="Student ID">
              <span class="inline-flex items-center gap-1">
                AL-2047
                <CopyButton value="AL-2047" label="Copy student ID" />
              </span>
            </DescriptionItem>
            <DescriptionItem term="Group">Web development, group B</DescriptionItem>
            <DescriptionItem term="Status">Enrolled</DescriptionItem>
            <DescriptionItem term="Guardian contact">
              <Button variant="link" href="mailto:guardian@example.com">guardian@example.com</Button>
            </DescriptionItem>
            <DescriptionItem term="Enrolled since">Sept 2024</DescriptionItem>
          </DescriptionList>
        </CardContent>
      </Card>`,
  }),
}

/** A hairline between rows, for a denser record than space alone would read as parted. */
export const Divided: Story = {
  render: () => ({
    components: parts,
    template: `
      <Card class="max-w-lg">
        <CardContent>
          <DescriptionList divided>
            <DescriptionItem term="Module">Web client</DescriptionItem>
            <DescriptionItem term="Practice">8.50</DescriptionItem>
            <DescriptionItem term="Exam">7.25</DescriptionItem>
            <DescriptionItem term="Final">7.80</DescriptionItem>
          </DescriptionList>
        </CardContent>
      </Card>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** A long value wraps in its own column instead of pushing the term out of its width. */
export const LongValue: Story = {
  render: () => ({
    components: parts,
    template: `
      <DescriptionList class="max-w-lg">
        <DescriptionItem term="Note">
          Missed the midterm practice for a documented medical reason; a makeup session was scheduled for the
          following week and completed with a passing grade.
        </DescriptionItem>
      </DescriptionList>`,
  }),
}

/** Nothing known yet: the value just shows a dash rather than an empty gap. */
export const EmptyValue: Story = {
  render: () => ({
    components: parts,
    template: `
      <DescriptionList class="max-w-lg">
        <DescriptionItem term="Guardian contact"><span class="text-fg-faint">—</span></DescriptionItem>
      </DescriptionList>`,
  }),
}

/** On a phone, term and value stack instead of squeezing into two columns. */
export const PhoneWidth: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => ({
    components: parts,
    template: `
      <DescriptionList divided>
        <DescriptionItem term="Student ID">AL-2047</DescriptionItem>
        <DescriptionItem term="Group">Web development, group B</DescriptionItem>
        <DescriptionItem term="Status">Enrolled</DescriptionItem>
      </DescriptionList>`,
  }),
}
