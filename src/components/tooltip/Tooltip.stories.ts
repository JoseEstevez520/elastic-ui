import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Button from '../button/Button.vue'
import Tooltip from './Tooltip.vue'
import TooltipGroup from './TooltipGroup.vue'

const meta = {
  title: 'Base/Tooltip',
  render: () => ({
    components: { Button, Tooltip },
    template: `
      <Tooltip content="Copies the link to this page">
        <Button variant="outline">Copy link</Button>
      </Tooltip>`,
  }),
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** A toolbar: once one tooltip shows, the next ones show at once while moving along. */
export const Group: Story = {
  render: () => ({
    components: { Button, Tooltip, TooltipGroup },
    setup: () => ({ actions: ['Bold', 'Italic', 'Underline', 'Strikethrough', 'Code'] }),
    template: `
      <TooltipGroup>
        <div class="flex gap-1">
          <Tooltip v-for="a in actions" :key="a" :content="a">
            <Button variant="ghost" size="icon" :aria-label="a">{{ a[0] }}</Button>
          </Tooltip>
        </div>
      </TooltipGroup>`,
  }),
}

export const Sides: Story = {
  render: () => ({
    components: { Button, Tooltip },
    setup: () => ({ sides: ['top', 'right', 'bottom', 'left'] }),
    template: `
      <div class="grid grid-cols-2 gap-x-32 gap-y-16 p-16">
        <Tooltip v-for="side in sides" :key="side" :content="'On the ' + side" :side="side">
          <Button variant="outline">{{ side }}</Button>
        </Tooltip>
      </div>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/** A long text wraps within a narrow width. */
export const LongText: Story = {
  render: () => ({
    components: { Button, Tooltip },
    template: `
      <Tooltip content="Guarda los cambios de este documento y los comparte con todas las personas que tienen acceso a la carpeta.">
        <Button variant="outline">Guardar y compartir</Button>
      </Tooltip>`,
  }),
}
