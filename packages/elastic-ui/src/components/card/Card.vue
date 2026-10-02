<script setup lang="ts">
import { computed, toRef, type Component, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { isExternal, useLink, type LinkTo } from '../../utils/link'
import { provideCardContext } from './card.context'
import { cardVariants, type CardVariants } from './card.variants'

/**
 * A surface a tone off the page, holding its parts (CardImage, CardHeader with CardTitle and
 * CardDescription, CardContent, CardFooter) in any order. Given `href`, `to` or `as`, the whole
 * card is the link, as a reference to a book, a talk or a project: a tone up under the pointer,
 * and, to another site, opening in a new tab with an outward arrow on its title.
 */
const props = defineProps<{
  variant?: CardVariants['variant']
  size?: CardVariants['size']
  /** The whole card links here. */
  href?: string
  /** The whole card is the app's RouterLink to this location. */
  to?: LinkTo
  /** The link component to render, such as NuxtLink, given `to` or `href`. */
  as?: string | Component
  class?: HTMLAttributes['class']
}>()

const link = useLink(props)
const external = computed(() => !!link.value && !!props.href && isExternal(props.href))
provideCardContext({ size: toRef(() => props.size ?? 'md'), external })
</script>

<template>
  <component
    :is="link?.is ?? 'div'"
    v-bind="link?.attrs"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    :class="cn(cardVariants({ variant, size, interactive: !!link }), props.class)"
  >
    <slot />
  </component>
</template>
