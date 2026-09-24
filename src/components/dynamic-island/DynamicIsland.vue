<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { dynamicIslandClass, dynamicIslandContentClass, dynamicIslandFloatingClass } from './dynamic-island.variants'

/**
 * A pill that changes shape with what it shows: a song, a timer, an upload. When `state`
 * changes, it turns into the new content's size and shape, a pill while it is low and a card with
 * large corners as it grows, while the old content leaves at once and the new one comes into
 * focus as the shape nearly arrives. It only moves when its state does.
 *
 * Put each state's content in the default slot, switched with `v-if` on the same `state`.
 */
const props = withDefaults(
  defineProps<{
    /** Names what it shows; a change of state is what makes it transform. */
    state: string
    /**
     * Held at the top of the screen, in the middle. Off by default: in a page with a header or a
     * sidebar it would compete with them, so it sits wherever it is placed.
     */
    floating?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { floating: false },
)

// The content on show. Set as each state's content mounts, and never cleared as the previous one
// leaves, which happens after the new one is in.
let content: HTMLElement | undefined
function setContent(el: unknown) {
  if (el instanceof HTMLElement) content = el
}
const size = ref<{ width: number; height: number }>()
const growing = ref(true)

// The shape animates between measured boxes; `auto` cannot be transitioned. Until the first
// measurement, and in server rendering, it simply wraps its content.
function measure() {
  const el = content
  if (!el) return
  const next = { width: el.offsetWidth, height: el.offsetHeight }
  const before = size.value
  if (before && before.width === next.width && before.height === next.height) return
  growing.value = !before || next.width * next.height >= before.width * before.height
  size.value = next
}

let observer: ResizeObserver | undefined
onMounted(() => {
  measure()
  observer = new ResizeObserver(measure)
  if (content) observer.observe(content)
})
onBeforeUnmount(() => observer?.disconnect())

// A new state brings new content: follow it, and measure it once it is in.
watch(
  () => props.state,
  async () => {
    await nextTick()
    observer?.disconnect()
    if (content) observer?.observe(content)
    measure()
  },
)

// Round as a pill while it is low; past that, corners stay large but no longer grow.
const MAX_RADIUS = 28
const style = computed(() =>
  size.value
    ? {
        width: `${size.value.width}px`,
        height: `${size.value.height}px`,
        borderRadius: `${Math.min(size.value.height / 2, MAX_RADIUS)}px`,
      }
    : undefined,
)
// Growing lets the eye follow; shrinking back only wants it done.
const duration = computed(() => (growing.value ? 'duration-[450ms]' : 'duration-300'))
</script>

<template>
  <div
    role="status"
    :style="style"
    :class="cn(dynamicIslandClass, duration, floating && dynamicIslandFloatingClass, props.class)"
  >
    <!-- The old content and the new share one cell while they swap; the island is sized to
         the new one, so the old one leaves from under the travelling shape. -->
    <div class="grid h-full w-full place-items-center">
      <Transition
        enter-from-class="opacity-0 blur-[2px]"
        leave-to-class="opacity-0"
        enter-active-class="transition-[opacity,filter] duration-[450ms] ease-soft delay-150 motion-reduce:transition-none"
        leave-active-class="transition-opacity duration-150 motion-reduce:transition-none"
      >
        <div :key="state" :ref="setContent" :class="dynamicIslandContentClass">
          <slot />
        </div>
      </Transition>
    </div>
  </div>
</template>
