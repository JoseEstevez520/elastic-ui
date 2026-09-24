<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import { prefersReducedMotion } from '../../utils/motion'
import { tocIndicatorClass, tocLinkVariants, tocTrackClass } from './table-of-contents.variants'

export interface TableOfContentsItem {
  /** The heading's `id`, the link's target. */
  id: string
  label: string
  /** 2 for a section, 3 for a subsection. */
  level?: 2 | 3
}

/**
 * "On this page": the page's sections beside it, following your reading. A mark on a hairline
 * slides to the section on screen as you scroll, taking its height; clicking one scrolls there
 * and the mark goes straight to it, without stopping at every section passed on the way.
 */
const props = withDefaults(
  defineProps<{
    items: TableOfContentsItem[]
    /** The heading above the list, also its accessible name. */
    title?: string
    /**
     * How far from the top of the viewport a heading counts as reached, in pixels: below a fixed
     * header, set it to the header's height and a little more.
     */
    offset?: number
    /**
     * What scrolls the page, when it is not the window: an element with its own overflow, such as
     * a `<main>`, or a selector for it.
     */
    scroller?: HTMLElement | string
    class?: HTMLAttributes['class']
  }>(),
  { title: labelFor('onThisPage'), offset: 96 },
)

/** The section being read. */
const active = defineModel<string>('active')

// The element that scrolls, or none for the window.
function container() {
  return typeof props.scroller === 'string' ? document.querySelector<HTMLElement>(props.scroller) : (props.scroller ?? null)
}

// The section being read: the last whose heading has passed the offset line, measured from the
// top of what scrolls. At the very end of the page it is the last one, even if its heading never
// gets that far up.
function read() {
  const scroller = container()
  const top = scroller ? scroller.getBoundingClientRect().top : 0
  let current = props.items[0]?.id
  for (const item of props.items) {
    const heading = document.getElementById(item.id)
    if (heading && heading.getBoundingClientRect().top - top <= props.offset + 1) current = item.id
  }
  const end = scroller
    ? scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2
    : window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
  return end ? props.items.at(-1)?.id : current
}

// Scrolling to a clicked section passes the ones between; until it lands, the mark stays on it.
let target: string | undefined
let landing: ReturnType<typeof setTimeout> | undefined
let frame = 0
function onScroll() {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    if (target) {
      clearTimeout(landing)
      landing = setTimeout(() => (target = undefined), 150)
      return
    }
    active.value = read()
  })
}
useEventListener(() => container() ?? window, 'scroll', onScroll, { passive: true })
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  clearTimeout(landing)
})

function go(event: MouseEvent, id: string) {
  const heading = document.getElementById(id)
  if (!heading || event.metaKey || event.ctrlKey || event.shiftKey) return
  event.preventDefault()
  target = id
  active.value = id
  heading.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(null, '', `#${id}`)
  // Focus follows, as a native jump to an anchor does, so the next Tab goes on from the section.
  if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1')
  heading.focus({ preventScroll: true })
  // Already there: no scroll will come to release it.
  landing = setTimeout(() => (target = undefined), 150)
}

// The mark sits over the active link's measured box. It takes its first place at once (a page
// opened halfway down just shows where you are) and slides from then on.
const list = useTemplateRef<HTMLElement>('list')
const mark = ref<{ top: number; height: number }>()
const sliding = ref(false)
function place() {
  const link = list.value?.querySelector<HTMLElement>('[aria-current]')
  mark.value = link ? { top: link.offsetTop, height: link.offsetHeight } : undefined
}
watch(active, () => nextTick(place))
watch(
  () => props.items,
  async () => {
    await nextTick()
    active.value = read()
    place()
  },
  { deep: true },
)

let observer: ResizeObserver | undefined
onMounted(() => {
  active.value = read()
  nextTick(() => {
    place()
    requestAnimationFrame(() => (sliding.value = true))
  })
  observer = new ResizeObserver(place)
  if (list.value) observer.observe(list.value)
})
onBeforeUnmount(() => observer?.disconnect())

const markStyle = computed(() =>
  mark.value ? { translate: `0 ${mark.value.top}px`, height: `${mark.value.height}px` } : { opacity: 0 },
)
</script>

<template>
  <nav :aria-label="title" :class="cn('text-sm', props.class)">
    <p class="mb-3 text-xs font-medium text-fg-secondary">{{ title }}</p>
    <ul ref="list" role="list" :class="tocTrackClass">
      <li
        aria-hidden="true"
        role="presentation"
        :class="[
          tocIndicatorClass,
          sliding && 'transition-[translate,height,opacity] duration-[450ms] ease-emphasized motion-reduce:transition-none',
        ]"
        :style="markStyle"
      />
      <li v-for="item in items" :key="item.id">
        <a
          :href="`#${item.id}`"
          :aria-current="item.id === active ? 'location' : undefined"
          :class="tocLinkVariants({ level: item.level ?? 2, active: item.id === active })"
          @click="go($event, item.id)"
        >
          {{ item.label }}
        </a>
      </li>
    </ul>
  </nav>
</template>
