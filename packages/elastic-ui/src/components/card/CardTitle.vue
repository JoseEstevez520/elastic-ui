<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ExternalIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import { useCardContext } from './card.context'
import { cardTitleVariants } from './card.variants'

const props = withDefaults(
  defineProps<{
    /** Heading level, so the card fits the page's outline. */
    as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    /** Said after the title of a card linking to another site, for screen readers. */
    newTabLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  { as: 'h3', newTabLabel: labelFor('newTab') },
)
const { size, external } = useCardContext()
</script>

<template>
  <component
    :is="as"
    :class="cn(cardTitleVariants({ size }), external && 'flex items-center justify-between gap-2', props.class)"
  >
    <slot />
    <template v-if="external">
      <span class="sr-only">({{ newTabLabel }})</span>
      <!-- Faint at rest, the text's colour under the pointer, as the card takes its tone. -->
      <ExternalIcon
        aria-hidden="true"
        class="size-4 shrink-0 text-fg-faint transition-colors duration-150 group-hover/card:text-fg"
      />
    </template>
  </component>
</template>
