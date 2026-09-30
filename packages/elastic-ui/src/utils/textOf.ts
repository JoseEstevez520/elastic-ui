import { Comment, Fragment, Text, type Slot, type VNode } from 'vue'

/** The plain text a slot renders, or undefined when it renders anything but text. */
export function textOf(slot: Slot | undefined): string | undefined {
  if (!slot) return undefined
  let text = ''
  const walk = (nodes: VNode[]): boolean =>
    nodes.every((node) => {
      if (node.type === Comment) return true
      if (node.type === Text) return (text += String(node.children)), true
      if (node.type === Fragment && Array.isArray(node.children)) return walk(node.children as VNode[])
      return false
    })
  return walk(slot()) ? text.trim() : undefined
}
