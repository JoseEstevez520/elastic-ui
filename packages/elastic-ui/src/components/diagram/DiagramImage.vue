<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { useThemeTokens } from '../../composables/useThemeTokens'
import { cn } from '../../utils/cn'
import { diagramSheet } from './diagram.sheet'

/**
 * A drawing made elsewhere (by a model, by a tool), an `<svg>` written with the diagram classes,
 * shown inside a Diagram. It is drawn as an image, so whatever it holds runs no script and reaches
 * nothing on the page; it gets the tokens of the current theme and the diagram classes as its own
 * stylesheet, and is drawn again when the theme changes. The Diagram round it says what it shows.
 */
const props = defineProps<{
  /** The SVG's markup, its root an `<svg>` with a `viewBox`. */
  svg: string
  class?: HTMLAttributes['class']
}>()

const tokens = useThemeTokens()
const src = computed(() => {
  if (!tokens.value || !/<svg\b/i.test(props.svg)) return undefined
  // Its root is the <svg>, so `:root` is where the tokens go.
  const sheet = `:root { ${tokens.value.declarations} color: var(--color-fg); font-family: var(--font-sans); }${diagramSheet}`
  const themed = props.svg.replace(/<svg\b[^>]*>/i, (tag) => `${tag}<style>${sheet}</style>`)
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(themed)}`
})
</script>

<template>
  <!-- Only once mounted: the tokens are read from the page. -->
  <img v-if="src" :src="src" alt="" decoding="async" :class="cn('block h-auto w-full', props.class)" />
</template>
