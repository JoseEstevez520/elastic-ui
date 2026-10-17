import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { File, Folder } from '@lucide/vue'
import { computed, defineComponent, h, ref, type PropType } from 'vue'
import TreeDrag from './TreeDrag.vue'
import TreeDragHandle from './TreeDragHandle.vue'
import TreeDragItem from './TreeDragItem.vue'
import type { TreeDragId, TreeDragMove } from './tree-drag.context'

const meta = { title: 'Navigation/TreeDrag', component: TreeDrag, parameters: { layout: 'centered' } } satisfies Meta<typeof TreeDrag>
export default meta
type Story = StoryObj<typeof meta>

interface Node {
  id: number
  parentId: number | null
  title: string
  section?: boolean
}

// The app owns its data: the part only says what moved where, and this moves it.
function moveIn(nodes: Node[], { id, parentId, index }: TreeDragMove): Node[] {
  const moved = nodes.find((n) => n.id === id)!
  const rest = nodes.filter((n) => n.id !== id)
  const siblings = rest.filter((n) => n.parentId === parentId)
  const before = siblings[index]
  const at = before ? rest.indexOf(before) : rest.length
  rest.splice(at, 0, { ...moved, parentId: parentId as number | null })
  return rest
}

const Branch: ReturnType<typeof defineComponent> = defineComponent({
  name: 'Branch',
  props: {
    nodes: { type: Array as PropType<Node[]>, required: true },
    parentId: { type: null as unknown as PropType<TreeDragId | null>, default: null },
    handle: Boolean,
  },
  setup(props) {
    const rows = computed(() => props.nodes.filter((n) => n.parentId === props.parentId))
    return () =>
      h(
        'ul',
        { class: props.parentId == null ? 'flex flex-col gap-0.5' : 'ml-5 flex flex-col gap-0.5' },
        rows.value.map((node, i) => {
          const count = props.nodes.filter((n) => n.parentId === node.id).length
          return h('li', { key: node.id }, [
            h(TreeDragItem, { id: node.id, parentId: props.parentId, index: i, section: node.section, count, handle: props.handle }, () =>
              h('div', { class: 'flex items-center gap-2 px-1.5 py-1.5' }, [
                props.handle ? h(TreeDragHandle) : null,
                h(node.section ? Folder : File, { class: 'size-4 text-fg-muted', 'aria-hidden': 'true' }),
                h('span', { class: 'text-label text-fg' }, node.title),
              ]),
            ),
            h(Branch, { nodes: props.nodes, parentId: node.id, handle: props.handle }),
          ])
        }),
      )
  },
})

const sample = (): Node[] => [
  { id: 1, parentId: null, title: 'Web client', section: true },
  { id: 2, parentId: 1, title: 'HTML' },
  { id: 3, parentId: 1, title: 'CSS' },
  { id: 4, parentId: 1, title: 'JavaScript' },
  { id: 5, parentId: null, title: 'Web server', section: true },
  { id: 6, parentId: 5, title: 'Servlets' },
  { id: 7, parentId: 5, title: 'Spring', section: true },
  { id: 8, parentId: 7, title: 'Beans' },
  { id: 9, parentId: null, title: 'Design', section: true },
  { id: 10, parentId: null, title: 'Welcome' },
]

/** Press a row and move it: the rows make room where it would land, a lit section means inside it. Alt with the arrows does it from the keyboard. */
export const Default: Story = {
  render: () => ({
    components: { TreeDrag, Branch },
    setup() {
      const nodes = ref(sample())
      return { nodes, move: (m: TreeDragMove) => (nodes.value = moveIn(nodes.value, m)) }
    },
    template: `<TreeDrag class="w-80" @move="move"><Branch :nodes="nodes" :parent-id="null" /></TreeDrag>`,
  }),
}

/** Situation, count: one row alone, and an empty section that can still take a row. */
export const Few: Story = {
  render: () => ({
    components: { TreeDrag, Branch },
    setup() {
      const nodes = ref<Node[]>([
        { id: 1, parentId: null, title: 'Notes' },
        { id: 2, parentId: null, title: 'Archive', section: true },
      ])
      return { nodes, move: (m: TreeDragMove) => (nodes.value = moveIn(nodes.value, m)) }
    },
    template: `<TreeDrag class="w-80" @move="move"><Branch :nodes="nodes" :parent-id="null" /></TreeDrag>`,
  }),
}

/** Situation, content: a very long title keeps its row, and the grip stays where it is. */
export const LongTitle: Story = {
  render: () => ({
    components: { TreeDrag, Branch },
    setup() {
      const nodes = ref<Node[]>([
        { id: 1, parentId: null, title: 'A title so long that it would not fit on one line of a narrow tree' },
        { id: 2, parentId: null, title: 'Short' },
      ])
      return { nodes, move: (m: TreeDragMove) => (nodes.value = moveIn(nodes.value, m)) }
    },
    template: `<TreeDrag class="w-56" @move="move"><Branch :nodes="nodes" :parent-id="null" /></TreeDrag>`,
  }),
}

/** With `handle` on the item, only the grip lifts a row, and the rest of the row is left alone. */
export const WithHandle: Story = {
  render: () => ({
    components: { TreeDrag, Branch },
    setup() {
      const nodes = ref(sample())
      return { nodes, move: (m: TreeDragMove) => (nodes.value = moveIn(nodes.value, m)) }
    },
    template: `<TreeDrag class="w-80" @move="move"><Branch :nodes="nodes" :parent-id="null" handle /></TreeDrag>`,
  }),
}
