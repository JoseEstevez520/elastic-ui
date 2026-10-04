<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import type { LinkTo } from '../../utils/link'
import { useLabels } from '../../utils/labels'
import Card from '../card/Card.vue'

/**
 * One side of a PageNav: a card that is the link to the previous or the next page. The title
 * goes in the default slot; `description` says in a line what the page covers (on the next page,
 * where it helps to decide). The chevron leans toward the page it goes to when pointed at.
 */
const props = defineProps<{
  direction: 'previous' | 'next'
  description?: string
  href?: string
  /** The app's RouterLink to this location. */
  to?: LinkTo
  /** The link component to render, such as NuxtLink, given `to` or `href`. */
  as?: string | Component
  /** The word above the title: "Previous" or "Next" by default. */
  label?: string
  class?: HTMLAttributes['class']
}>()

// Read while rendering, so the word follows a language switch.
const labels = useLabels()
</script>

<template>
  <Card
    size="sm"
    :href="href"
    :to="to"
    :as="as"
    :class="
      cn(
        'group h-full gap-1',
        direction === 'next' && 'items-end text-right sm:col-start-2',
        props.class,
      )
    "
  >
    <span class="flex items-center gap-1.5 px-4 text-ui text-fg-muted">
      <ChevronLeftIcon
        v-if="direction === 'previous'"
        class="size-3.5 transition-transform duration-150 group-hover:-translate-x-0.5"
        aria-hidden="true"
      />
      {{ label ?? labels[direction] }}
      <ChevronRightIcon
        v-if="direction === 'next'"
        class="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </span>
    <span class="px-4 text-label text-fg"><slot /></span>
    <span v-if="description" class="px-4 text-ui text-fg-secondary">{{ description }}</span>
  </Card>
</template>
