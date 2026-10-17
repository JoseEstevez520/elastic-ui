import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Archive, Copy, Folder, FolderInput, Pencil, Settings, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import Button from '../button/Button.vue'
import Field from '../field/Field.vue'
import Select from '../select/Select.vue'
import SelectContent from '../select/SelectContent.vue'
import SelectItem from '../select/SelectItem.vue'
import SelectTrigger from '../select/SelectTrigger.vue'
import SelectValue from '../select/SelectValue.vue'
import NavTree from '../nav-tree/NavTree.vue'
import NavTreeGroup from '../nav-tree/NavTreeGroup.vue'
import NavTreeItem from '../nav-tree/NavTreeItem.vue'
import PopoverMorph from './PopoverMorph.vue'
import PopoverMorphItem from './PopoverMorphItem.vue'
import PopoverMorphSeparator from './PopoverMorphSeparator.vue'

const meta = {
  title: 'Overlays/PopoverMorph',
  // Top-aligned: centering would re-center the trigger as the panel grows.
  render: () => ({
    components: { Button, PopoverMorph },
    template: `
      <PopoverMorph label="Share">
        <template #trigger>Share</template>
        <template #default="{ close }">
          <p class="font-medium">Share this page</p>
          <p class="mt-1 text-fg-secondary">Anyone with the link can read it.</p>
          <div class="mt-3 flex justify-end gap-2">
            <Button size="sm" variant="ghost" @click="close">Cancel</Button>
            <Button size="sm" @click="close">Copy link</Button>
          </div>
        </template>
      </PopoverMorph>`,
  }),
} satisfies Meta<typeof PopoverMorph>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * A menu: the trigger's box grows into the list. Arrow keys move between the items, a letter jumps
 * to the next one starting with it, and choosing one closes the menu.
 */
export const Menu: Story = {
  render: () => ({
    components: { PopoverMorph, PopoverMorphItem, PopoverMorphSeparator },
    setup: () => ({ icons: { Archive, Copy, FolderInput, Pencil, Trash2 } }),
    template: `
      <PopoverMorph role="menu" label="Actions" class="[--popover-width:13rem]">
        <template #trigger>Actions</template>
        <PopoverMorphItem :icon="icons.Pencil" shortcut="⌘R">Rename</PopoverMorphItem>
        <PopoverMorphItem :icon="icons.Copy" shortcut="⌘D">Duplicate</PopoverMorphItem>
        <PopoverMorphItem :icon="icons.FolderInput">Move to…</PopoverMorphItem>
        <PopoverMorphSeparator />
        <PopoverMorphItem :icon="icons.Archive">Archive</PopoverMorphItem>
        <PopoverMorphItem :icon="icons.Trash2" disabled>Delete (not allowed)</PopoverMorphItem>
      </PopoverMorph>`,
  }),
}

/** Lined up with the trigger's end edge: grows to the left. */
export const AlignEnd: Story = {
  render: () => ({
    components: { PopoverMorph },
    template: `
      <div class="flex justify-end">
        <PopoverMorph align="end" label="Account">
          <template #trigger>Account</template>
          <p class="font-medium">Jane Doe</p>
          <p class="mt-1 text-fg-secondary">jane@example.com</p>
        </PopoverMorph>
      </div>`,
  }),
}

/** Opened from outside with `v-model:open`. */
export const Controlled: Story = {
  render: () => ({
    components: { Button, PopoverMorph },
    setup: () => ({ open: ref(false) }),
    template: `
      <div class="flex items-start gap-4">
        <PopoverMorph v-model:open="open" label="Details">
          <template #trigger>Details</template>
          Also opened by the button beside it.
        </PopoverMorph>
        <Button variant="ghost" @click="open = true">Open from here</Button>
      </div>`,
  }),
}

/**
 * Ghost triggers (`variant="ghost"`), for a quiet bar or a row of actions: bare at rest, they take
 * on the panel's tone and edge only as they grow into it. `size="sm"` for a bar, `size="icon"`
 * for an icon alone, which needs its name. They sit beside ghost Buttons without standing out.
 */
export const Ghost: Story = {
  render: () => ({
    components: { Button, PopoverMorph, PopoverMorphItem },
    setup: () => ({ icons: { Folder, Pencil, Copy, Settings } }),
    template: `
      <div class="flex items-center gap-1">
        <Button variant="ghost" size="sm">Back</Button>
        <PopoverMorph variant="ghost" size="sm" label="Folder">
          <template #trigger><component :is="icons.Folder" aria-hidden="true" />Unit 2 · CSS</template>
          <p class="text-fg-secondary">Saved in Web client, unit 2.</p>
        </PopoverMorph>
        <PopoverMorph variant="ghost" label="Details">
          <template #trigger>Details</template>
          <p class="text-fg-secondary">A ghost trigger at the usual size.</p>
        </PopoverMorph>
        <PopoverMorph variant="ghost" size="icon" role="menu" label="Actions" class="[--popover-width:12rem]">
          <template #trigger><component :is="icons.Settings" aria-hidden="true" /><span class="sr-only">Actions</span></template>
          <PopoverMorphItem :icon="icons.Pencil">Rename</PopoverMorphItem>
          <PopoverMorphItem :icon="icons.Copy">Duplicate</PopoverMorphItem>
        </PopoverMorph>
      </div>`,
  }),
}

const places: Record<string, string> = {
  unsure: 'Not sure',
  'web-client': 'Web client',
  'unit-1': 'Unit 1 · HTML',
  'unit-2': 'Unit 2 · CSS',
  'web-server': 'Web server',
  php: 'PHP',
  laravel: 'Laravel',
}

/**
 * A place to pick, from a quiet button at the end of a bar: a ghost trigger grows into a
 * `selectable` NavTree, and picking a place closes it (`@select="close"`). On a phone it fills the
 * width (`fluid`).
 */
export const Picker: Story = {
  render: () => ({
    components: { Button, PopoverMorph, NavTree, NavTreeGroup, NavTreeItem },
    setup: () => {
      const place = ref<string>()
      return { place, Folder, shown: computed(() => (place.value ? places[place.value] : 'Where does it go?')) }
    },
    template: `
      <div class="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm">Back</Button>
        <PopoverMorph variant="ghost" size="sm" align="end" fluid label="Where it goes">
          <template #trigger><component :is="Folder" aria-hidden="true" />{{ shown }}</template>
          <template #default="{ close }">
            <NavTree v-model="place" selectable label="Where it goes" @select="close">
              <NavTreeItem value="unsure">Not sure</NavTreeItem>
              <NavTreeGroup label="Web client" value="web-client">
                <NavTreeItem value="unit-1">Unit 1 · HTML</NavTreeItem>
                <NavTreeItem value="unit-2">Unit 2 · CSS</NavTreeItem>
              </NavTreeGroup>
              <NavTreeGroup label="Web server" value="web-server">
                <NavTreeItem value="php">PHP</NavTreeItem>
                <NavTreeItem value="laravel">Laravel</NavTreeItem>
              </NavTreeGroup>
            </NavTree>
          </template>
        </PopoverMorph>
      </div>`,
  }),
}

// Situations every change has to keep working. See "Situations" in DECISIONS.md.

/**
 * By a screen's edge: lined up with its start, the panel would run off the right, so it keeps the
 * screen's margin instead, the box moving sideways as it grows from the button. Near the bottom it
 * opens upwards, though `side` asks for down.
 */
export const NearTheEdge: Story = {
  render: () => ({
    components: { PopoverMorph },
    template: `
      <div class="flex h-[85vh] flex-col justify-between">
        <div class="flex justify-end">
          <PopoverMorph label="Right edge">
            <template #trigger>At the right edge</template>
            <p class="text-fg-secondary">Lined up with the start, it would run off the screen; it keeps the margin instead.</p>
          </PopoverMorph>
        </div>
        <div class="flex justify-end">
          <PopoverMorph variant="ghost" size="sm" label="Bottom corner">
            <template #trigger>In the bottom corner</template>
            <p v-for="n in 4" :key="n" class="mb-2 text-fg-secondary">No room below: it opens upwards, and keeps off the right edge.</p>
          </PopoverMorph>
        </div>
      </div>`,
  }),
}

/** On a phone, `fluid` fills the width less the screen's margin, wherever the trigger is. */
export const PhoneWidth: Story = {
  ...Picker,
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Opens upwards, for a trigger near the bottom of the screen. */
export const SideTop: Story = {
  render: () => ({
    components: { PopoverMorph },
    template: `
      <div class="flex h-[80vh] items-end">
        <PopoverMorph side="top" label="Help">
          <template #trigger>Help</template>
          <p class="text-fg-secondary">Grows upwards from the trigger.</p>
        </PopoverMorph>
      </div>`,
  }),
}

/** A long list in the panel: the panel grows to hold the open list, and the list scrolls in its own bounds. */
export const FieldsThatOpen: Story = {
  render: () => ({
    components: { Field, PopoverMorph, Select, SelectContent, SelectItem, SelectTrigger, SelectValue },
    setup: () => ({ icon: ref('icon-1'), icons: Array.from({ length: 40 }, (_, i) => `icon-${i + 1}`) }),
    template: `
      <PopoverMorph label="Icon">
        <template #trigger>Icon</template>
        <Field label="Icon">
          <Select v-model="icon">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="name in icons" :key="name" :value="name">{{ name }}</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </PopoverMorph>`,
  }),
}

/** Taller than the screen allows: the panel scrolls inside. */
export const LongContent: Story = {
  render: () => ({
    components: { PopoverMorph },
    template: `
      <PopoverMorph label="Notes">
        <template #trigger>Long content</template>
        <p v-for="n in 20" :key="n" class="mb-2">Paragraph {{ n }}: enough text to make the panel taller than the screen.</p>
      </PopoverMorph>`,
  }),
}

/** A label much longer than in English: the trigger's box starts at its real width. */
export const LongLabel: Story = {
  render: () => ({
    components: { PopoverMorph },
    template: `
      <PopoverMorph label="Options">
        <template #trigger>Configuración de privacidad avanzada</template>
        <p class="text-fg-secondary">Narrower than its trigger: the box shrinks and grows down at once.</p>
      </PopoverMorph>`,
  }),
}

/** Text flowing around it stays put: the trigger keeps its place while the panel floats over. */
export const InText: Story = {
  render: () => ({
    components: { PopoverMorph },
    template: `
      <div class="max-w-lg">
        <p class="mb-3 text-fg">Text above the trigger, to check that nothing around it moves when it opens.</p>
        <PopoverMorph label="Info">
          <template #trigger>Info</template>
          <p class="text-fg-secondary">Floats over the paragraph below.</p>
        </PopoverMorph>
        <p class="mt-3 text-fg">Text below the trigger. The panel covers it instead of pushing it down.</p>
      </div>`,
  }),
}

export const TwoInstances: Story = {
  render: () => ({
    components: { PopoverMorph },
    template: `
      <div class="flex gap-4">
        <PopoverMorph v-for="name in ['First', 'Second']" :key="name" :label="name">
          <template #trigger>{{ name }}</template>
          The {{ name.toLowerCase() }} one. Opening the other closes this one.
        </PopoverMorph>
      </div>`,
  }),
}
