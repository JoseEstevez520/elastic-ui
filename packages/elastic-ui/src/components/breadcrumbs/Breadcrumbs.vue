<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useTemplateRef, type HTMLAttributes } from 'vue'
import { ChevronRightIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { labelFor, useLabels } from '../../utils/labels'
import Menu from '../menu/Menu.vue'
import MenuContent from '../menu/MenuContent.vue'
import MenuItem from '../menu/MenuItem.vue'
import MenuTrigger from '../menu/MenuTrigger.vue'
import TextMorph from '../text-morph/TextMorph.vue'
import BreadcrumbsLink from './BreadcrumbsLink.vue'
import {
  breadcrumbsCurrentClass,
  breadcrumbsItemClass,
  breadcrumbsLinkClass,
  breadcrumbsListClass,
  breadcrumbsSeparatorClass,
  breadcrumbsSiblingsIconClass,
  breadcrumbsSiblingsTriggerClass,
  type BreadcrumbsItem,
} from './breadcrumbs.variants'

/**
 * Where the page sits, as a path of crumbs (Notion, Vercel, GitHub), so the sidebar can keep to
 * the main sections. A separator with siblings opens the other pages at the next level, as the
 * path bar in macOS's Finder does, to jump from one to the next without going back.
 *
 * Crumbs are given as `items`, from the top down to the current page, so each level keeps its
 * place as the page changes: a crumb whose page changes morphs into its new name (TextMorph), and
 * crumbs added or dropped come into focus or fade. A path too long for its row scrolls, held at
 * the current page.
 */
const props = withDefaults(
  defineProps<{
    items: BreadcrumbsItem[]
    /** The navigation's accessible name. */
    label?: string
    class?: HTMLAttributes['class']
  }>(),
  { label: labelFor('breadcrumb') },
)

const labels = useLabels()

// How long the crumbs hold still before the row is taken to its end (see below).
const SETTLE_MS = 140

// Crumbs there when the page loads just show; only a change made afterwards brings one in.
const ready = ref(false)
onMounted(() => nextTick(() => (ready.value = true)))

// A row too long for its room scrolls, held at its end so the current page always shows. The
// crumbs above it slide out behind a fading edge, only while some are out of sight; they can be
// scrolled back to. Kept at the end as the row resizes and whenever the crumbs change, but only
// once they stop changing size: a crumb that changes page morphs its name, and TextMorph grows
// its box over a moment while the new text already measures its full width. For those frames
// the row overflows by what has not grown yet, and scrolling it to the end then would push
// every crumb to the left and back, the ones that did not change included.
const nav = useTemplateRef<HTMLElement>('nav')
const hidden = ref(false)
const row = () => nav.value?.querySelector('ol')
function toEnd() {
  const el = row()
  if (!el) return
  el.scrollLeft = el.scrollWidth
  onScroll()
}
function onScroll() {
  hidden.value = (row()?.scrollLeft ?? 0) > 0
}
let settle: ReturnType<typeof setTimeout> | undefined
function toEndWhenSettled() {
  clearTimeout(settle)
  settle = setTimeout(toEnd, SETTLE_MS)
}
let observer: ResizeObserver | undefined
onMounted(() => {
  toEnd()
  observer = new ResizeObserver(toEndWhenSettled)
  if (nav.value) observer.observe(nav.value)
})
onUpdated(toEndWhenSettled)
onBeforeUnmount(() => {
  observer?.disconnect()
  clearTimeout(settle)
})

const isCurrent = (page: { label: string }, item: BreadcrumbsItem) => page.label === item.label
</script>

<template>
  <nav ref="nav" :aria-label="label" :class="cn('min-w-0', props.class)">
    <!-- Keyed by level, so a crumb whose page changes is the same crumb, morphing its name. -->
    <TransitionGroup
      tag="ol"
      :class="cn(breadcrumbsListClass, hidden && 'mask-fade-l')"
      @scroll.passive="onScroll"
      :enter-active-class="ready ? 'animate-blur-in motion-reduce:animate-none' : undefined"
      leave-active-class="animate-content-out motion-reduce:animate-none"
    >
      <li
        v-for="(item, level) in items"
        :key="level"
        :class="breadcrumbsItemClass"
      >
        <template v-if="level > 0">
          <Menu v-if="item.siblings?.length">
            <MenuTrigger :aria-label="labels.pagesAtThisLevel" :class="breadcrumbsSiblingsTriggerClass">
              <ChevronRightIcon aria-hidden="true" :class="breadcrumbsSiblingsIconClass" />
            </MenuTrigger>
            <MenuContent>
              <MenuItem v-for="page in item.siblings" :key="page.label" as-child>
                <BreadcrumbsLink
                  :to="page.to"
                  :href="page.href"
                  :aria-current="isCurrent(page, item) ? 'page' : undefined"
                  :class="isCurrent(page, item) ? 'font-medium text-fg' : 'text-fg-secondary'"
                >
                  {{ page.label }}
                </BreadcrumbsLink>
              </MenuItem>
            </MenuContent>
          </Menu>
          <ChevronRightIcon v-else aria-hidden="true" :class="breadcrumbsSeparatorClass" />
        </template>

        <span
          v-if="level === items.length - 1"
          aria-current="page"
          :class="breadcrumbsCurrentClass"
        >
          <TextMorph :text="item.label" />
        </span>
        <BreadcrumbsLink v-else :to="item.to" :href="item.href" :class="breadcrumbsLinkClass">
          <TextMorph :text="item.label" />
        </BreadcrumbsLink>
      </li>
    </TransitionGroup>
  </nav>
</template>
