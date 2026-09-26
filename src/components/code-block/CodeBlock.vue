<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import CopyButton from '../copy-button/CopyButton.vue'
import { codeBlockClass, codeBlockCopyFloatingClass, codeBlockPreClass } from './code-block.variants'

/**
 * A block of code with a way to copy it. Named by its file or language on a quiet caption, with
 * the copy button beside it; without a name, the button waits in the corner until the pointer
 * comes. Long lines scroll sideways and fade at the edge that has more, never cut.
 *
 * The library ships no highlighter: pass highlighted markup (Shiki, highlight.js…) in the
 * default slot, and the plain `code` is still what gets copied.
 */
const props = defineProps<{
  code: string
  /** The file it belongs to, shown on the caption. */
  title?: string
  /** Shown on the caption when there is no title. */
  language?: string
  /** Long lines wrap instead of scrolling sideways, for a narrow column. */
  wrap?: boolean
  class?: HTMLAttributes['class']
}>()

const text = computed(() => props.code.replace(/\n$/, ''))
const caption = computed(() => props.title ?? props.language)

// Which sides have code scrolled out of sight, to fade them.
const pre = useTemplateRef<HTMLElement>('pre')
const hidden = ref({ start: false, end: false })
function measure() {
  const el = pre.value
  if (!el) return
  hidden.value = { start: el.scrollLeft > 1, end: el.scrollLeft + el.clientWidth < el.scrollWidth - 1 }
}
let observer: ResizeObserver | undefined
onMounted(() => {
  measure()
  observer = new ResizeObserver(measure)
  if (pre.value) observer.observe(pre.value)
})
onBeforeUnmount(() => observer?.disconnect())

const FADE = '24px'
const mask = computed(() => {
  const { start, end } = hidden.value
  if (!start && !end) return undefined
  const from = start ? `transparent, #000 ${FADE}` : '#000'
  const to = end ? `#000 calc(100% - ${FADE}), transparent` : '#000'
  return { maskImage: `linear-gradient(to right, ${from}, ${to})` }
})
</script>

<template>
  <figure :class="cn(codeBlockClass, props.class)">
    <figcaption v-if="caption" class="flex h-10 items-center justify-between gap-2 pr-1 pl-4 text-meta text-fg-muted">
      <span class="truncate font-mono">{{ caption }}</span>
      <CopyButton :value="text" class="size-8" />
    </figcaption>
    <!-- Focusable, so code wider than the block can be scrolled from the keyboard. -->
    <pre
      ref="pre"
      tabindex="0"
      :class="cn(codeBlockPreClass, caption && 'pt-0', wrap && 'whitespace-pre-wrap [overflow-wrap:anywhere]')"
      :style="mask"
      @scroll.passive="measure"
    ><code><slot>{{ text }}</slot></code></pre>
    <CopyButton v-if="!caption" :value="text" :class="codeBlockCopyFloatingClass" />
  </figure>
</template>
