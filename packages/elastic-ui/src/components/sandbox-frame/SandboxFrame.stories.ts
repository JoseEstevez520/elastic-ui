import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SandboxFrame from './SandboxFrame.vue'
// The host serves the runtime; here Storybook does, from the package's own build
// (`npm run build:sandbox`, run before Storybook starts; see .storybook/main.ts).
const runtime = '/runtime/sandbox-runtime.js'

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

// Pieces made of the library's parts, as a model would write them: a single-file component with a
// plain <script>, the parts used by name in the template.
const INSTANCES = `<template>
  <div class="flex flex-col gap-4">
    <p class="m-0 text-ui text-fg-secondary">Each press asks the container for a logger.</p>
    <div class="flex flex-wrap gap-2">
      <Button @click="ask">Ask for a logger</Button>
      <Button variant="ghost" :disabled="!asked" @click="reset">Start over</Button>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div v-for="scope in scopes" :key="scope.name" class="flex flex-col gap-2">
        <span class="text-label text-fg">{{ scope.name }}
          <TextMorph class="text-fg-muted" :text="count(scope)" />
        </span>
        <div class="flex flex-wrap gap-2">
          <DiagramChip v-for="n in scope.instances" :key="n" :color="scope.color">Logger #{{ n }}</DiagramChip>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'

export default {
  setup() {
    const asked = ref(0)
    const scopes = computed(() => [
      { name: 'Singleton', color: '#2563eb', instances: asked.value ? 1 : 0 },
      { name: 'Prototype', color: '#d97706', instances: asked.value },
    ])
    const count = (scope) => scope.instances === 1 ? '1 instance' : scope.instances + ' instances'
    return {
      asked,
      scopes,
      count,
      ask: () => asked.value++,
      reset: () => (asked.value = 0),
    }
  },
}
</script>`

const SERVERS = `<template>
  <div class="flex flex-col gap-4">
    <Field label="Requests per second">
      <Slider v-model="load" :min="10" :max="400" :step="10" :format="(v) => v + ' req/s'" />
    </Field>
    <Switch v-model="cached">Cache the answers</Switch>
    <div class="flex flex-wrap items-center gap-2">
      <DiagramChip v-for="n in servers" :key="n" color="#0891b2">Server {{ n }}</DiagramChip>
    </div>
    <p class="m-0 text-ui text-fg-secondary">
      <TextMorph :text="servers === 1 ? 'One server is enough.' : servers + ' servers needed.'" />
    </p>
  </div>
</template>

<script>
import { computed, ref } from 'vue'

export default {
  setup() {
    const load = ref(120)
    const cached = ref(false)
    // Each server takes 50 requests a second; a cache answers half of them itself.
    const servers = computed(() => Math.max(1, Math.ceil((cached.value ? load.value / 2 : load.value) / 50)))
    return { load, cached, servers }
  },
}
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

/**
 * Made of the library's parts: a Vue piece with Buttons, DiagramChips and a TextMorph, run in the
 * frame by the sandbox runtime. Press to ask for an instance: a singleton stays at one, a
 * prototype makes one each time. Switch the theme: the count stays.
 */
export const WithLibraryParts: Story = {
  args: { html: undefined, piece: INSTANCES, runtime, label: 'Singleton against prototype: how many instances each press makes' },
}

/** A Slider and a Switch driving a value, the chips and the sentence following it. */
export const ASliderDrivingAValue: Story = {
  args: { html: undefined, piece: SERVERS, runtime, label: 'How many servers a load needs' },
}

/** Both on a phone, each as tall as what it holds, in the theme of the page. */
export const LibraryPartsOnAPhone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: () => ({
    components: { SandboxFrame },
    setup: () => ({ instances: INSTANCES, servers: SERVERS, runtime }),
    template: `
      <div class="flex flex-col gap-6">
        <SandboxFrame :piece="instances" :runtime="runtime" label="Singleton against prototype" />
        <SandboxFrame :piece="servers" :runtime="runtime" label="How many servers a load needs" />
      </div>`,
  }),
}

/** The same pieces in the dark theme. */
export const LibraryPartsInTheDark: Story = {
  ...LibraryPartsOnAPhone,
  globals: { theme: 'dark', viewport: { value: 'mobile1', isRotated: false } },
}
