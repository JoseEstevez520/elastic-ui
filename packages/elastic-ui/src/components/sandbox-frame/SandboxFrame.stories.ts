import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SandboxFrame from './SandboxFrame.vue'

// Pieces as a model might write them: plain HTML, inline script, the library's tokens as CSS variables.
const COUNTER = `<!doctype html>
<html><body>
  <p>Press it a few times, then switch the theme: the count stays.</p>
  <button id="add">Add one</button> <span id="count" style="font-variant-numeric: tabular-nums">0</span>
  <script>
    let n = 0
    document.getElementById('add').onclick = () => (document.getElementById('count').textContent = ++n)
  </script>
</body></html>`

const GROWS = `
  <p>Each row makes it taller; the frame follows, and never scrolls inside.</p>
  <button id="add">Add a row</button> <button id="remove">Remove one</button>
  <ul id="list"></ul>
  <script>
    const list = document.getElementById('list')
    document.getElementById('add').onclick = () => list.insertAdjacentHTML('beforeend', '<li>Row ' + (list.children.length + 1) + '</li>')
    document.getElementById('remove').onclick = () => list.lastElementChild?.remove()
  </script>`

const SLIDER = `
  <style>
    .row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap }
    .bar { height: 12px; border-radius: var(--radius-md); background: var(--color-accent); transition: width 150ms }
  </style>
  <div class="row">
    <label for="n">Requests per second</label>
    <input id="n" type="range" min="1" max="100" value="30">
  </div>
  <p>Servers needed: <strong id="out"></strong></p>
  <div class="bar" id="bar"></div>
  <p><span class="diagram-chip" style="--diagram-color: #0891b2">A chip from the diagram classes</span></p>
  <script>
    const n = document.getElementById('n')
    const draw = () => {
      document.getElementById('out').textContent = Math.ceil(n.value / 25)
      document.getElementById('bar').style.width = n.value + '%'
    }
    n.oninput = draw
    draw()
  </script>`

// It asks the network for something, and the policy says no.
const FETCHES = `
  <p id="out">Trying to reach another site…</p>
  <script>
    fetch('https://example.com').then(
      () => (document.getElementById('out').textContent = 'Reached it.'),
      () => (document.getElementById('out').textContent = 'Blocked: no network from inside the frame.'),
    )
  </script>`

const meta = {
  title: 'Content/SandboxFrame',
  component: SandboxFrame,
  args: { html: COUNTER, label: 'A counter' },
  render: (args) => ({
    components: { SandboxFrame },
    setup: () => ({ args }),
    template: `<SandboxFrame v-bind="args" class="max-w-xl" />`,
  }),
} satisfies Meta<typeof SandboxFrame>

export default meta
type Story = StoryObj<typeof meta>

/** A piece with state of its own, which a change of theme does not reset. */
export const Default: Story = {}

/** As tall as what it holds, growing and shrinking with it. */
export const FollowsItsContent: Story = {
  args: { html: GROWS, label: 'A list that grows' },
}

/** The library's look inside: plain fields and buttons, the tokens as variables, the diagram classes. */
export const Themed: Story = {
  args: { html: SLIDER, label: 'How many servers a load needs' },
}

/** No network: a request from inside fails. */
export const NoNetwork: Story = {
  args: { html: FETCHES, label: 'A piece that tries to reach the network' },
}

/** Two on one page, each with its own height and state, and on a phone, never scrolling inside. */
export const TwoOnAPhone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: () => ({
    components: { SandboxFrame },
    setup: () => ({ grows: GROWS, slider: SLIDER }),
    template: `
      <div class="flex flex-col gap-6">
        <SandboxFrame :html="slider" label="How many servers a load needs" />
        <SandboxFrame :html="grows" label="A list that grows" />
      </div>`,
  }),
}
