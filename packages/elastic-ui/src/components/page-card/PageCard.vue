<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { boxOf, useMorphBox, type Box } from '../../composables/useMorphBox'
import { usePortalSize, usePortalTarget } from '../../composables/usePortalTarget'
import { useEventListener } from '../../composables/useEventListener'
import { ChevronLeftIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import { morphCloseTransition, morphTransition, prefersReducedMotion } from '../../utils/motion'
import Glow from '../glow/Glow.vue'

/**
 * A card that becomes its page: a project, a case study, a note. At rest, a card glowing in its
 * image's colours, the image on top and its words under it (the default slot). Pressed, the card's
 * own box grows to fill the screen (a real size, never scaled: useMorphBox); its image travels to
 * become the page's header; its glow stretches with it into the page's ground; its words fade as
 * the page's (the `page` slot) come into focus as a wave. Back (its button, Escape, or the browser's
 * back), the page's content fades, then it all folds back into the card, image and glow with it.
 *
 * With `href`, the address becomes the page's while it is open, so it can be shared and the
 * browser's back closes it; a visitor arriving at that address gets the app's own page for it,
 * which just shows (what is open when the page loads just shows).
 */
const props = withDefaults(
  defineProps<{
    image: string
    imageAlt?: string
    /** The page's own address, shown while it is open. */
    href?: string
    /** Names the page for assistive technology: its title. */
    title: string
    backLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  { imageAlt: '', backLabel: labelFor('back') },
)
const open = defineModel<boolean>('open', { default: false })
const portalTo = usePortalTarget()
const size = usePortalSize()

const card = useTemplateRef<HTMLButtonElement>('card')
const photo = useTemplateRef<HTMLElement>('photo')
const hero = useTemplateRef<HTMLElement>('hero')
const back = useTemplateRef<HTMLButtonElement>('back')

// The box: from the card to the whole screen and back (useMorphBox), the card's image travelling
// alongside it from its place in the card to the header's and back.
const photoBox = ref<Box>()
const heroBox = ref<Box>()
const { shown, placed, grown, visible, settled, style } = useMorphBox({
  open,
  from: () => {
    photoBox.value = boxOf(photo.value)
    return boxOf(card.value)
  },
  to: () => ({ top: 0, left: 0, ...size() }),
  returnFocus: () => card.value,
})
const surfaceStyle = computed(() => style({ borderRadius: ['var(--radius-2xl)', '0px'] }))

// The header's place once the page fills the screen: while the box still sits on the card, the
// header's place within it is its place from the screen's corner once the box has grown there.
watch(placed, (isPlaced) => {
  if (!isPlaced) return
  const h = boxOf(hero.value)
  const c = boxOf(card.value)
  if (h && c) heroBox.value = { top: h.top - c.top, left: h.left - c.left, width: h.width, height: h.height }
})
// Leaving, the header may have scrolled: the image travels back from where it is now.
watch(open, (isOpen) => !isOpen && shown.value && (heroBox.value = boxOf(hero.value) ?? heroBox.value))
// Landed, the back button takes the focus, as a dialog's first control would.
watch(settled, async (isSettled) => isSettled && (await nextTick(), back.value?.focus({ preventScroll: true })))

// The image travels while the box moves; once landed, the header in the page takes over. Its
// radius stays the same all the way (the card's image and the header share `--radius-2xl`).
const travelling = computed(() => shown.value && !settled.value)
const photoStyle = computed(() => {
  const b = grown.value ? heroBox.value : photoBox.value
  const t = grown.value ? morphTransition : morphCloseTransition
  return {
    top: `${b?.top ?? 0}px`,
    left: `${b?.left ?? 0}px`,
    width: `${b?.width ?? 0}px`,
    height: `${b?.height ?? 0}px`,
    transition:
      !placed.value || prefersReducedMotion()
        ? 'none'
        : ['top', 'left', 'width', 'height']
            .map((p) => `${p} ${t.duration}s cubic-bezier(${t.ease.join(',')})`)
            .join(','),
  }
})

// The page scrolls, not what is behind it.
watch(shown, (isShown) => (document.documentElement.style.overflow = isShown ? 'hidden' : ''))
onBeforeUnmount(() => shown.value && (document.documentElement.style.overflow = ''))

// Its own address while open: pushed when it opens, so the browser's back closes it; closing from
// the page goes back through that same step.
let pushed = false
watch(open, (isOpen) => {
  if (!props.href) return
  if (isOpen && !pushed) {
    history.pushState({ pageCard: props.href }, '', props.href)
    pushed = true
  }
})
useEventListener(
  () => window,
  'popstate',
  () => {
    if (pushed && open.value) {
      pushed = false
      open.value = false
    }
  },
)
function close() {
  if (pushed) history.back()
  else open.value = false
}
useEventListener<KeyboardEvent>(
  () => document,
  'keydown',
  (e) => e.key === 'Escape' && open.value && close(),
)
</script>

<template>
  <button
    ref="card"
    type="button"
    :aria-label="title"
    :class="
      cn(
        'group relative isolate block w-full cursor-pointer overflow-hidden rounded-[var(--radius-2xl)] text-left focus-ring',
        'shadow-[inset_0_0_0_1px_var(--color-border)]',
        shown && 'invisible',
        props.class,
      )
    "
    @click="open = true"
  >
    <Glow :src="image" class="-z-10" />
    <div class="p-3">
      <img
        ref="photo"
        :src="image"
        :alt="imageAlt"
        class="aspect-[4/3] w-full rounded-[var(--radius-2xl)] object-cover"
      />
    </div>
    <div class="px-5 pt-2 pb-5"><slot /></div>
  </button>

  <Teleport :to="portalTo">
    <template v-if="shown">
      <!-- The box: the card's own glow, stretching into the page's ground. -->
      <div
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        class="fixed z-50 overflow-hidden bg-[color:var(--color-bg)]"
        :style="surfaceStyle"
      >
        <Glow :src="image" />
        <!-- The card's words, where they were, fading as the box leaves and back as it lands. -->
        <div
          aria-hidden="true"
          :class="[
            'pointer-events-none absolute top-0 left-0 px-5 pb-5 transition-opacity',
            !grown ? 'opacity-100 delay-150 duration-300' : 'opacity-0 duration-150',
          ]"
          :style="{ width: `${card?.offsetWidth ?? 0}px`, paddingTop: `${(photoBox?.height ?? 0) + 32}px` }"
        >
          <slot />
        </div>
        <!-- The page, at the screen's size from the start, pinned to the box's corner. -->
        <div
          :class="[
            'absolute top-0 left-0 h-dvh w-screen overscroll-contain scrollbar-subtle [scrollbar-gutter:stable]',
            settled ? 'overflow-y-auto' : 'overflow-hidden',
          ]"
        >
          <div class="mx-auto max-w-3xl px-6 pt-6 pb-16">
            <button
              ref="back"
              type="button"
              :class="[
                'mb-6 inline-flex h-9 cursor-pointer items-center gap-1 rounded-full pr-3 pl-2 text-ui text-fg-secondary transition-[opacity,color] hover:text-fg focus-ring',
                visible ? 'opacity-100 delay-300 duration-300' : 'opacity-0 duration-150',
              ]"
              @click="close"
            >
              <ChevronLeftIcon aria-hidden="true" class="size-4" /> {{ backLabel }}
            </button>
            <img
              ref="hero"
              :src="image"
              :alt="imageAlt"
              :class="[
                'aspect-[16/9] w-full rounded-[var(--radius-2xl)] object-cover',
                settled ? 'visible' : 'invisible',
              ]"
            />
            <div
              :class="
                visible
                  ? 'stagger-children mt-8 [--stagger-delay:0.26s]'
                  : 'mt-8 opacity-0 transition-opacity duration-150'
              "
            >
              <slot name="page" :close="close" />
            </div>
          </div>
        </div>
      </div>
      <!-- The image, travelling from the card to the header and back, above the box. -->
      <img
        v-if="travelling"
        :src="image"
        alt=""
        aria-hidden="true"
        class="pointer-events-none fixed z-50 rounded-[var(--radius-2xl)] object-cover"
        :style="photoStyle"
      />
    </template>
  </Teleport>
</template>
