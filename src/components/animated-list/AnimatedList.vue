<script setup lang="ts" generic="T">
import { AnimatePresence, MotionConfig, motion } from 'motion-v'
import { computed, onMounted, ref, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { contentOut, morphCloseTransition, morphTransition } from '../../utils/motion'

/**
 * A list whose items slide to their new place when it is filtered, sorted or changed, instead of
 * jumping. Items render from `items` and a scoped slot rather than as child parts: Motion measures
 * each item's layout when this list re-renders, and a part that did not update itself would miss
 * the measurement and jump.
 */
const props = withDefaults(
  defineProps<{
    items: T[]
    /** A key per item that stays the same while the list changes. Defaults to the item itself. */
    itemKey?: (item: T) => string | number
    as?: 'ul' | 'ol' | 'div'
    /** Whether the items there on the first render come in as a wave, or just show. */
    appear?: boolean
    /** Fold items in this direction after they fade, keeping them in the flow while leaving. */
    collapse?: 'vertical' | 'horizontal'
    class?: HTMLAttributes['class']
    itemClass?: HTMLAttributes['class']
  }>(),
  { as: 'ul', appear: true },
)

// Two roots (the list and the empty state), so attributes go to the list.
defineOptions({ inheritAttrs: false })

defineSlots<{
  default?(props: { item: T; index: number }): unknown
  /** Shown instead of the list while it has no items. */
  empty?(): unknown
}>()

const keyOf = (item: T) => props.itemKey?.(item) ?? (item as string | number)
const itemComponent = computed(() => (props.as === 'div' ? motion.div : motion.li))
const presenceMode = computed(() => (props.collapse ? 'sync' : 'popLayout'))
const leave = computed(() =>
  props.collapse === 'vertical'
    ? {
        opacity: 0,
        height: 0,
        paddingTop: 0,
        paddingBottom: 0,
        transition: {
          opacity: contentOut,
          height: { ...morphCloseTransition, delay: contentOut.duration },
          paddingTop: { ...morphCloseTransition, delay: contentOut.duration },
          paddingBottom: { ...morphCloseTransition, delay: contentOut.duration },
        },
      }
    : props.collapse === 'horizontal'
      ? {
          opacity: 0,
          width: 0,
          transition: {
            opacity: contentOut,
            width: { ...morphCloseTransition, delay: contentOut.duration },
          },
        }
      : { opacity: 0, transition: contentOut },
)

// Nothing ever overlaps. Leaving items fade out first, and only then do the rest slide into the
// gap; items that arrive wait until the rest have mostly made room for them.
const EXIT = contentOut.duration
const MAKE_ROOM = 0.3
const moveDelay = ref(0)
const transition = computed(() => ({ ...morphTransition, delay: moveDelay.value }))

// Enter delays in ms, set once per item: changing one mid-animation restarts it. The first items,
// or a whole new set, come in as one wave like the rest of the library (`stagger-items`).
const delays = new Map<string | number, number>()
let wave = true
onMounted(() => (wave = false))
// Without `appear`, what is there on the first render just shows, as anything open when a page
// loads does; an item only comes in once it arrives afterwards.
const quiet = new Set(props.appear ? [] : props.items.map(keyOf))

// Runs before the list re-renders, so the delays are in place for the change that triggers them.
// Watching the keys, not the array, also catches changes made in place (`push`, `splice`).
watch(
  () => props.items.map(keyOf),
  (keys, previous) => {
    const current = new Set(keys)
    const removed = previous.some((key) => !current.has(key))
    for (const key of delays.keys()) if (!current.has(key)) delays.delete(key)
    for (const key of quiet) if (!current.has(key)) quiet.delete(key)
    moveDelay.value = removed && !props.collapse ? EXIT : 0
    wave = !keys.some((key) => delays.has(key))
  },
)

function enterDelay(item: T, index: number) {
  const key = keyOf(item)
  if (!delays.has(key)) delays.set(key, wave ? Math.min(index, 7) * 40 : (moveDelay.value + MAKE_ROOM) * 1000)
  return `${delays.get(key)}ms`
}
</script>

<template>
  <MotionConfig :transition="transition" reduced-motion="user">
    <!-- `relative` anchors items taken out of the flow by the default `popLayout` mode. Collapse
         mode keeps the leaving item in the flow while its size folds away. -->
    <component :is="as" v-bind="$attrs" :class="cn('relative', props.class)">
      <AnimatePresence :mode="presenceMode" :initial="false">
        <!-- `position` only, so text never scales. The fade-in fills backwards only: a fill that
             lasted would override the opacity Motion sets on the way out. -->
        <component
          :is="itemComponent"
          v-for="(item, index) in items"
          :key="keyOf(item)"
          layout="position"
          :exit="leave"
          :style="{ animationDelay: enterDelay(item, index) }"
          :class="
            cn(
              props.collapse && 'overflow-hidden',
              !quiet.has(keyOf(item)) && 'animate-[blur-in_0.45s_var(--ease-soft)_backwards] motion-reduce:animate-none',
              itemClass,
            )
          "
        >
          <slot :item="item" :index="index" />
        </component>
      </AnimatePresence>
    </component>
  </MotionConfig>
  <!-- Beside the list rather than instead of it, so the last item can still fade out. -->
  <slot v-if="!items.length" name="empty" />
</template>
