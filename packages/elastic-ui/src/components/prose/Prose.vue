<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'

/**
 * An article's type: headings, paragraphs, lists, links, inline code, quotes, tables and images,
 * as a page of notes written in Markdown needs them. Pass the rendered Markdown as `html`, or put
 * the content in the slot, library parts included: they keep their look and are spaced like a
 * paragraph. `not-prose` on a block opts it out. The same styles are the `prose` utility.
 */
const props = withDefaults(
  defineProps<{
    /** Rendered HTML, such as Markdown turned into HTML. Only trusted content. */
    html?: string
    as?: string
    class?: HTMLAttributes['class']
  }>(),
  { as: 'div' },
)
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <component :is="as" v-if="html !== undefined" :class="cn('prose', props.class)" v-html="html" />
  <component :is="as" v-else :class="cn('prose', props.class)"><slot /></component>
</template>
