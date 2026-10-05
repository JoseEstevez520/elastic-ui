<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef, type HTMLAttributes } from 'vue'
import { useScrolled } from '../../composables/useScrolled'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'

/**
 * A page's top bar, held at the top as it scrolls: the page's colour over a blur, so content
 * passes softly behind it, with a hairline under it only once the page has moved. It takes its
 * own room in the flow, so nothing moves when it holds. For a page without a sidebar that wants a
 * quiet bar; MorphHeader is the one that turns into a pill.
 *
 * The logo goes in the `logo` slot, the links in the default slot (ghost small Buttons) and what
 * sits on the right in `actions`. Below `md` the links fold away and the logo and actions stay.
 * Its height is published as `--page-header-height`, which TableOfContents and Prose's headings
 * read, so an anchor never lands under it.
 *
 * `clear` leaves it with no veil while the page is at the top, for a page that opens on colour (an
 * Aurora, a Glow, a photo) running up behind the bar: the colour shows through untouched, and the
 * veil comes in with the hairline once the page moves. The page pulls that first block up under
 * the bar (`-mt-14`) itself.
 */
const props = withDefaults(
  defineProps<{
    /** Names the links' navigation, for screen readers. */
    label?: string
    /** No hairline under it even once the page has moved. */
    seamless?: boolean
    /** No veil while the page is at the top: what runs up behind the bar shows through. */
    clear?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { label: labelFor('mainNav') },
)

defineSlots<{
  logo?(): unknown
  default?(): unknown
  actions?(): unknown
}>()

const scrolled = useScrolled(1)
const header = useTemplateRef<HTMLElement>('header')

let observer: ResizeObserver | undefined
onMounted(() => {
  const root = document.documentElement
  observer = new ResizeObserver(() => root.style.setProperty('--page-header-height', `${header.value?.offsetHeight ?? 0}px`))
  if (header.value) observer.observe(header.value)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  document.documentElement.style.removeProperty('--page-header-height')
})
</script>

<template>
  <header
    ref="header"
    :class="
      cn(
        'sticky top-0 z-40 border-b backdrop-blur-xl backdrop-saturate-150 transition-colors duration-300 ease-glide',
        clear && !scrolled
          ? 'bg-transparent'
          : 'bg-[color:var(--sticky-header-bg,color-mix(in_srgb,var(--color-bg)_70%,transparent))]',
        scrolled && !seamless ? 'border-border' : 'border-transparent',
        props.class,
      )
    "
  >
    <div class="mx-auto flex h-14 w-[min(100%-2rem,var(--sticky-header-max-width,64rem))] items-center justify-between gap-4">
      <div class="flex shrink-0 items-center text-fg">
        <slot name="logo" />
      </div>
      <nav v-if="$slots.default" :aria-label="label" class="hidden items-center gap-1 md:flex">
        <slot />
      </nav>
      <div class="flex shrink-0 items-center gap-1">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>
