<script setup lang="ts">
import { CollapsibleTrigger as TriggerPrimitive } from 'reka-ui'
import { nextTick, onBeforeUnmount, ref, useSlots, useTemplateRef } from 'vue'
import Collapsible from '../../components/collapsible/Collapsible.vue'
import CollapsibleContent from '../../components/collapsible/CollapsibleContent.vue'
import { chatThreadLineClass } from '../../components/chat/chat.variants'
import { morphCloseTransition } from '../../utils/motion'

/**
 * Lab: a word in a text that opens to what it means, in its place, never over the text: made of
 * the library's own parts. The word is marked with SelectionMenu's band (faint at rest, fuller
 * when open). Pressed, the paragraph opens under the word's line with Collapsible's own opening
 * (it grows from the top and the content comes in as a wave), the definition hanging from a fine
 * thread as ChatSources' lines do; "More" is a Collapsible inside it. Closing, the words go
 * first, then the paragraph closes up again. After Curio.
 *
 * The only new thing is where to open: at the end of the word's line, so the lines above and the
 * rest of that line stay where they are and only what follows moves down.
 */
defineProps<{ title?: string }>()
const slots = useSlots()

const open = ref(false)
const word = useTemplateRef<HTMLElement>('word')
// Where the paragraph opens: a block set into the text at the end of the word's line.
const gap = ref<HTMLElement | null>(null)

// The first character on a later line than the word, in the text after it: the paragraph opens
// just before it. If the word ends its paragraph, it opens at the paragraph's end.
function openingPoint(): { node: Node; offset: number } | { after: Element } {
  const el = word.value!
  const rects = el.getClientRects()
  // The word's line ends at its box's bottom; a character whose middle is below it is on a later line.
  const lineBottom = rects[rects.length - 1]!.bottom
  const block = el.closest('p, li, dd, blockquote') ?? el.parentElement!
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  let node: Node | null
  while ((node = walker.nextNode())) {
    if (el.contains(node) || !(el.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING)) continue
    const text = node.textContent ?? ''
    for (let i = 0; i < text.length; i++) {
      range.setStart(node, i)
      range.setEnd(node, i + 1)
      const r = range.getClientRects()[0]
      if (r && (r.top + r.bottom) / 2 > lineBottom) return { node, offset: i }
    }
  }
  return { after: block }
}

async function toggle() {
  if (open.value) return void onOpenChange(false)
  const point = openingPoint()
  const el = document.createElement('span')
  el.className = 'block'
  if ('after' in point) point.after.appendChild(el)
  else {
    const range = document.createRange()
    range.setStart(point.node, point.offset)
    range.insertNode(el)
  }
  gap.value = el
  await nextTick()
  onOpenChange(true)
}

// Closed, once the paragraph has closed up, the gap goes and the text is whole again.
let timer: ReturnType<typeof setTimeout> | undefined
function onOpenChange(isOpen: boolean) {
  open.value = isOpen
  clearTimeout(timer)
  if (!isOpen) timer = setTimeout(mend, morphCloseTransition.duration * 1000 + 50)
}
function mend() {
  const el = gap.value
  if (!el || open.value) return
  gap.value = null
  const parent = el.parentNode
  nextTick(() => {
    el.remove()
    parent?.normalize()
  })
}
onBeforeUnmount(() => {
  clearTimeout(timer)
  gap.value?.remove()
})
</script>

<template>
  <Collapsible :open="open" class="contents" @update:open="onOpenChange">
    <!-- The word opens its own way (it first sets the paragraph's gap), so it is a plain button
         rather than Collapsible's trigger, which would toggle on its own. -->
    <button
      ref="word"
      type="button"
      :aria-expanded="open ? 'true' : 'false'"
      :class="[
        'inline cursor-pointer rounded-[var(--radius-sm)] px-[0.15em] -mx-[0.15em] text-inherit transition-colors duration-150 focus-ring',
        open
          ? 'bg-[color:var(--selection-bg,color-mix(in_srgb,var(--color-accent)_28%,transparent))] text-fg'
          : 'bg-[color:color-mix(in_srgb,var(--color-accent)_10%,transparent)] hover:bg-[color:color-mix(in_srgb,var(--color-accent)_18%,transparent)]',
      ]"
      @click.prevent="toggle"
    >
      <slot />
    </button>
    <Teleport v-if="gap" :to="gap">
      <CollapsibleContent class="pb-0">
        <!-- The definition hanging from its word on a fine thread, as ChatSources' lines. -->
        <span :class="[chatThreadLineClass, 'my-2 block text-[0.95em] leading-relaxed']">
          <span v-if="title" class="block font-medium text-fg">{{ title }}</span>
          <span class="block"><slot name="definition" /></span>
          <Collapsible v-if="slots.more" class="mt-1 block">
            <TriggerPrimitive
              class="cursor-pointer text-sm font-medium text-[color:var(--color-accent)] hover:underline focus-ring data-[state=open]:hidden"
            >
              More
            </TriggerPrimitive>
            <CollapsibleContent class="pb-0"><slot name="more" /></CollapsibleContent>
          </Collapsible>
        </span>
      </CollapsibleContent>
    </Teleport>
  </Collapsible>
</template>
