<script setup lang="ts">
import { AnimatePresence, MotionConfig, motion } from 'motion-v'
import { computed, onBeforeUnmount, onMounted, ref, useId, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { useScrolled } from '../../composables/useScrolled'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import { contentOut, EASE_GLIDE, morphCloseTransition, morphTransition, useReducedMotion } from '../../utils/motion'
import MorphHeaderRegion from './MorphHeaderRegion.vue'
import { provideMorphHeaderContext } from './morph-header.context'
import { morphHeaderGlassClass, morphHeaderSurfaceVariants, morphHeaderWidth } from './morph-header.variants'

// The app's motion preference (setMotionPreference), not only the system's.
const reducedMotion = useReducedMotion()

const props = withDefaults(
  defineProps<{
    /** Pixels of scroll before the bar turns into a pill. */
    scrollThreshold?: number
    /**
     * `responsive`: links inline whenever they fit in the bar, behind the menu button otherwise.
     * `scrolled`: as `responsive` at the top of the page; once scrolled, the pill holds only the
     * logo and the menu button, the smallest it can be while reading.
     * `always`: only the logo and the menu button, at every width.
     */
    menu?: 'responsive' | 'scrolled' | 'always'
    menuLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  { scrollThreshold: 40, menu: 'responsive', menuLabel: labelFor('menu') },
)

const open = defineModel<boolean>('open', { default: false })

// `open` is the intent and `expanded` is the surface. They grow together, but when closing the
// surface keeps its panel shape until the links have faded out; otherwise it narrows to a pill
// while the panel is still in the flow and the morph lands on a tall sliver.
const expanded = ref(false)
watch(open, (isOpen) => {
  if (isOpen) expanded.value = true
})

// The panel folds back into the pill faster than it grew (see morphCloseTransition). Scrolling
// between bar and pill keeps the regular pace.
const collapsing = ref(false)
function onPanelHidden() {
  collapsing.value = !open.value
  expanded.value = open.value
}

const scrolled = useScrolled(() => props.scrollThreshold)

// `scrolled` folds the links away once the page has moved, in two steps, as leaving comes before
// making room (DECISIONS, Motion rules): the links fade where they stand, and halfway through
// their fade the bar starts folding into the pill and the menu button comes in, so it answers the
// scroll at once. Back at the top, the pill grows into the bar first and
// the links come back once it has arrived. Swapping them in the frame the morph starts tore it.
// The links leave quicker than content usually does: the fold waits on them.
const LINKS_OUT = 100
// The menu button comes in while the pill is still forming, not once it has landed.
const menuIn = { duration: 0.22, delay: 0.12, ease: 'linear' } as const
const folded = ref(false)
const linksHidden = ref(false)
const menuEntering = ref(false)
let foldTimer: ReturnType<typeof setTimeout> | undefined
watch(
  scrolled,
  (isScrolled, wasScrolled) => {
    if (props.menu !== 'scrolled') return
    clearTimeout(foldTimer)
    // Already scrolled when the page loads: it just shows folded.
    if (wasScrolled === undefined) {
      folded.value = linksHidden.value = isScrolled
      return
    }
    if (isScrolled) {
      linksHidden.value = true
      foldTimer = setTimeout(() => {
        menuEntering.value = true
        folded.value = true
      }, LINKS_OUT / 2)
    } else {
      menuEntering.value = false
      folded.value = false
      foldTimer = setTimeout(() => (linksHidden.value = false), morphTransition.duration * 1000)
    }
  },
  { immediate: true },
)
onBeforeUnmount(() => clearTimeout(foldTimer))

// The pill's shape and glass follow the fold in `scrolled`, the scroll itself otherwise.
const pill = computed(() => (props.menu === 'scrolled' ? folded.value : scrolled.value))
// Whether the links may sit inline now.
const responsive = computed(() => props.menu === 'responsive' || (props.menu === 'scrolled' && !folded.value))

// Whether the inline nav fits is measured, not guessed from a breakpoint, so it holds for any
// number of links, any label length and any language. An invisible, inert copy of the nav and
// actions gives their natural width; a box with the bar's width gives the room there is. Until
// the first measurement (and in server rendering) the `lg` breakpoint stands in.
const MIN_GAP = 40
const logo = useTemplateRef<HTMLElement>('logo')
const measureBar = useTemplateRef<HTMLElement>('measureBar')
const measureNav = useTemplateRef<HTMLElement>('measureNav')
const fits = ref<boolean>()
let fitObserver: ResizeObserver | undefined

onMounted(() => {
  const measure = () => {
    if (!measureBar.value || !measureNav.value) return
    const needed = (logo.value?.offsetWidth ?? 0) + MIN_GAP + measureNav.value.offsetWidth
    fits.value = needed <= measureBar.value.offsetWidth
  }
  fitObserver = new ResizeObserver(measure)
  for (const el of [logo.value, measureBar.value, measureNav.value]) if (el) fitObserver.observe(el)
})
onBeforeUnmount(() => fitObserver?.disconnect())

const inline = computed(() => responsive.value && fits.value !== false)
// Class sets for the inline nav and for the menu button and panel, before and after measuring.
const inlineClass = computed(() => (fits.value === undefined ? 'hidden lg:flex' : 'flex'))
const menuClass = computed(() => (responsive.value && fits.value === undefined ? 'lg:hidden' : undefined))
const showMenu = computed(() => !responsive.value || fits.value !== true)
const shape = computed(() => (expanded.value ? 'panel' : pill.value ? 'pill' : 'bar'))

// Radius and hairline live inline on the element that owns `layout`, so Motion can correct them
// against its scale. A CSS border would stretch to several pixels mid-morph.
const surfacePaint = computed(() => ({
  borderRadius: { panel: 24, pill: 9999, bar: 0 }[shape.value],
  boxShadow: `0 0 0 ${shape.value === 'bar' ? 0 : 1}px var(--color-border)`,
}))

const close = () => (open.value = false)
provideMorphHeaderContext({ open, close })

// The surface grows by scaling, and Motion corrects the links against it but not a scrollbar,
// which would be drawn stretched and sliding. A long panel only scrolls once it has arrived;
// timed, since Motion sends no event when there is no animation.
const settled = ref(false)
let settleTimer: ReturnType<typeof setTimeout> | undefined
watch(open, (isOpen) => {
  clearTimeout(settleTimer)
  settled.value = false
  if (isOpen) settleTimer = setTimeout(() => (settled.value = true), morphTransition.duration * 1000)
})
onBeforeUnmount(() => clearTimeout(settleTimer))

const header = useTemplateRef<HTMLElement>('header')
useEventListener<KeyboardEvent>(() => document, 'keydown', (event) => {
  if (event.key === 'Escape') close()
})
useEventListener<PointerEvent>(() => document, 'pointerdown', (event) => {
  if (open.value && event.target instanceof Node && !header.value?.contains(event.target)) close()
})
// Once the links fit inline again the panel has nothing left to show.
watch([fits, responsive], ([nowFits, inlineAllowed]) => {
  if (inlineAllowed && nowFits) close()
})

// Focus inside the panel would be lost when it unmounts, so it goes back to the menu button.
const menuButton = useTemplateRef<HTMLElement>('menuButton')
const panelId = useId()
watch(open, (isOpen) => {
  const panel = document.getElementById(panelId)
  if (!isOpen && panel?.contains(document.activeElement)) menuButton.value?.focus({ preventScroll: true })
})
</script>

<template>
  <header
    ref="header"
    :class="cn('pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center', props.class)"
  >
    <MotionConfig :transition="collapsing ? morphCloseTransition : morphTransition" :reduced-motion="reducedMotion">
      <motion.div
        layout
        :initial="false"
        :style="surfacePaint"
        :class="morphHeaderSurfaceVariants({ shape })"
        @layout-animation-complete="collapsing = false"
      >
        <!-- The glass is its own layer, faded in on scroll. Fading the whole surface instead
             would dim the blur along with it and read as flat rather than frosted. -->
        <motion.div
          v-if="!expanded"
          aria-hidden="true"
          :initial="false"
          :animate="{ opacity: pill ? 1 : 0, scaleX: pill ? 1 : 0.9 }"
          :transition="{ duration: pill ? 0.3 : 0.16, delay: pill ? 0.12 : 0, ease: EASE_GLIDE }"
          :style="{ borderRadius: 'inherit' }"
          :class="morphHeaderGlassClass"
        />

        <!-- `layout` on every fixed-size child makes each ride the parent's interpolation
             instead of being stretched by its scale. -->
        <motion.div
          layout
          :class="
            cn(
              'relative z-10 flex items-center',
              { panel: 'justify-between px-2', pill: 'gap-4 sm:gap-5', bar: 'justify-between' }[shape],
            )
          "
        >
          <motion.div layout class="flex shrink-0 items-center">
            <div ref="logo" class="flex items-center"><slot name="logo" /></div>
          </motion.div>

          <motion.div
            v-if="inline"
            layout
            :class="
              cn(
                'items-center gap-5 transition-opacity motion-reduce:transition-none',
                linksHidden ? 'opacity-0 duration-100 ease-linear' : 'opacity-100 duration-[450ms] ease-soft',
                inlineClass,
              )
            "
          >
            <MorphHeaderRegion placement="inline">
              <slot />
            </MorphHeaderRegion>
            <motion.div v-if="$slots.actions" layout class="flex items-center gap-2">
              <slot name="actions" />
            </motion.div>
          </motion.div>

          <motion.div
            v-if="showMenu"
            layout
            :initial="menuEntering ? { opacity: 0 } : false"
            :animate="{ opacity: 1, transition: menuIn }"
            :class="cn('flex shrink-0', menuClass)"
          >
            <button
              ref="menuButton"
              type="button"
              :aria-label="menuLabel"
              :aria-expanded="open"
              :aria-controls="panelId"
              class="flex size-9 cursor-pointer items-center justify-center rounded-full focus-ring"
              @click="open = !open"
            >
              <svg class="size-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path v-if="open" d="M18 6 6 18M6 6l12 12" />
                <path v-else d="M4 5h16M4 12h16M4 19h16" />
              </svg>
            </button>
          </motion.div>
        </motion.div>

        <!-- The panel is part of the surface, never a detached slab. Its height is capped so the
             surface's vertical scale, and with it the distortion, stays bounded. -->
        <!-- Links come into focus as one wave once the panel has nearly grown (`stagger-items` in
             MorphHeaderNav); leaving, the whole panel fades at once. -->
        <AnimatePresence :initial="false" :on-exit-complete="onPanelHidden">
          <motion.div
            v-if="open"
            :id="panelId"
            :initial="false"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0, transition: contentOut }"
            :class="
              cn(
                'relative z-10 mt-2 max-h-[calc(100dvh-6rem)] w-full overscroll-contain scrollbar-subtle',
                settled ? 'overflow-y-auto' : 'overflow-hidden',
                menuClass,
              )
            "
          >
            <MorphHeaderRegion placement="panel">
              <slot />
            </MorphHeaderRegion>
            <div
              v-if="$slots.actions"
              class="flex items-center gap-2 px-3 py-3 animate-[blur-in_0.45s_var(--ease-soft)_0.3s_both] motion-reduce:animate-none"
            >
              <slot name="actions" />
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </MotionConfig>

    <!-- Measures whether the inline nav fits; see `fits`. Inert, so it is never focused or read. -->
    <div v-if="menu !== 'always'" aria-hidden="true" inert class="invisible absolute inset-x-0 top-0 h-0 overflow-hidden">
      <div ref="measureBar" :class="morphHeaderWidth" />
      <div ref="measureNav" class="flex w-max items-center gap-5 whitespace-nowrap">
        <MorphHeaderRegion placement="measure">
          <slot />
        </MorphHeaderRegion>
        <div v-if="$slots.actions" class="flex items-center gap-2"><slot name="actions" /></div>
      </div>
    </div>
  </header>
</template>
