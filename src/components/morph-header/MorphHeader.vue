<script setup lang="ts">
import { AnimatePresence, MotionConfig, motion } from 'motion-v'
import { computed, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { useEventListener } from '../../composables/useEventListener'
import { useScrolled } from '../../composables/useScrolled'
import { cn } from '../../utils/cn'
import { morphTransition } from '../../utils/motion'
import MorphHeaderRegion from './MorphHeaderRegion.vue'
import { provideMorphHeaderContext } from './morph-header.context'
import { morphHeaderGlassClass, morphHeaderSurfaceVariants } from './morph-header.variants'

/** From this width up the nav sits inline and the mobile panel is closed. Matches `lg`. */
const DESKTOP_QUERY = '(min-width: 64rem)'

const props = withDefaults(
  defineProps<{
    /** Pixels of scroll before the bar turns into a pill. */
    scrollThreshold?: number
    /**
     * `responsive`: links inline from `lg` up, behind the menu button below it.
     * `always`: only the logo and the menu button, at every width.
     */
    menu?: 'responsive' | 'always'
    menuLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  { scrollThreshold: 40, menu: 'responsive', menuLabel: 'Menu' },
)

const open = defineModel<boolean>('open', { default: false })

// `open` is the intent and `expanded` is the surface. They grow together, but when closing the
// surface keeps its panel shape until the links have faded out; otherwise it narrows to a pill
// while the panel is still in the flow and the morph lands on a tall sliver.
const expanded = ref(false)
watch(open, (isOpen) => {
  if (isOpen) expanded.value = true
})

const scrolled = useScrolled(() => props.scrollThreshold)
const responsive = computed(() => props.menu === 'responsive')
const shape = computed(() => (expanded.value ? 'panel' : scrolled.value ? 'pill' : 'bar'))

// Radius and hairline live inline on the element that owns `layout`, so Motion can correct them
// against its scale. A CSS border would stretch to several pixels mid-morph.
const surfacePaint = computed(() => ({
  borderRadius: { panel: 24, pill: 9999, bar: 0 }[shape.value],
  boxShadow: `0 0 0 ${shape.value === 'bar' ? 0 : 1}px var(--color-border)`,
}))

const close = () => (open.value = false)
provideMorphHeaderContext({ open, close })

const header = useTemplateRef<HTMLElement>('header')
useEventListener<KeyboardEvent>(() => document, 'keydown', (event) => {
  if (event.key === 'Escape') close()
})
useEventListener<PointerEvent>(() => document, 'pointerdown', (event) => {
  if (open.value && event.target instanceof Node && !header.value?.contains(event.target)) close()
})
useEventListener<MediaQueryListEvent>(() => window.matchMedia(DESKTOP_QUERY), 'change', (event) => {
  if (responsive.value && event.matches) close()
})
</script>

<template>
  <header
    ref="header"
    :class="cn('pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center', props.class)"
  >
    <MotionConfig :transition="morphTransition" reduced-motion="user">
      <motion.div layout :initial="false" :style="surfacePaint" :class="morphHeaderSurfaceVariants({ shape })">
        <!-- The glass is its own layer, faded in on scroll. Fading the whole surface instead
             would dim the blur along with it and read as flat rather than frosted. -->
        <motion.div
          v-if="!expanded"
          aria-hidden="true"
          :initial="false"
          :animate="{ opacity: scrolled ? 1 : 0, scaleX: scrolled ? 1 : 0.9 }"
          :transition="{ duration: scrolled ? 0.3 : 0.16, delay: scrolled ? 0.12 : 0, ease: [0.38, 0.49, 0, 1] }"
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
            <slot name="logo" />
          </motion.div>

          <motion.div v-if="responsive" layout class="hidden items-center gap-5 lg:flex">
            <MorphHeaderRegion placement="inline">
              <slot />
            </MorphHeaderRegion>
            <motion.div v-if="$slots.actions" layout class="flex items-center gap-2">
              <slot name="actions" />
            </motion.div>
          </motion.div>

          <motion.button
            layout
            type="button"
            :aria-label="menuLabel"
            :aria-expanded="open"
            :class="cn('flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-accent', responsive && 'lg:hidden')"
            @click="open = !open"
          >
            <svg class="size-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path v-if="open" d="M18 6 6 18M6 6l12 12" />
              <path v-else d="M4 5h16M4 12h16M4 19h16" />
            </svg>
          </motion.button>
        </motion.div>

        <!-- The panel is part of the surface, never a detached slab. Its height is capped so the
             surface's vertical scale, and with it the distortion, stays bounded. -->
        <AnimatePresence :initial="false" :on-exit-complete="() => (expanded = open)">
          <motion.div
            v-if="open"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1, transition: { duration: 0.22, delay: 0.3, ease: 'linear' } }"
            :exit="{ opacity: 0, transition: { duration: 0.16, ease: 'linear' } }"
            :class="
              cn(
                'relative z-10 mt-2 max-h-[calc(100dvh-6rem)] w-full overflow-y-auto overscroll-contain',
                responsive && 'lg:hidden',
              )
            "
          >
            <MorphHeaderRegion placement="panel">
              <slot />
            </MorphHeaderRegion>
            <div v-if="$slots.actions" class="flex items-center gap-2 px-3 py-3">
              <slot name="actions" />
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </MotionConfig>
  </header>
</template>
