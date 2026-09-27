<script setup lang="ts">
import { computed, ref, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { paletteOf } from '../../utils/palette'
import Aurora from '../aurora/Aurora.vue'

/**
 * A ground glowing in its content's own colours: the library's Aurora (its lights drifting over a
 * wash of the same colours, under its grain), its colours taken from an image. Put it behind what
 * shows that image (a project, a track, a cover), filling its box. The Aurora on its own is the
 * light for AI; the Glow is the same light in the colour of the content. Changing `src`, the new
 * colours fade in over the old.
 */
const props = withDefaults(
  defineProps<{
    src: string
    /** `soft` for text on it; `vivid` for colour alone. */
    variant?: 'soft' | 'vivid'
    class?: HTMLAttributes['class']
  }>(),
  { variant: 'soft' },
)

const palette = ref<string[]>([])
watch(
  () => props.src,
  async (src) => {
    try {
      palette.value = await paletteOf(src)
    } catch {
      palette.value = []
    }
  },
  { immediate: true },
)
// The image's colours as the Aurora's lights: kept in a range the Aurora's own sit in, and lifted
// a little in chroma so a muted photo still glows.
const lights = computed(() =>
  Object.fromEntries(
    palette.value.map((c, i) => [
      `--aurora-${i + 1}`,
      `oklch(from ${c} clamp(0.5, l, 0.78) calc(c * ${props.variant === 'vivid' ? 1.5 : 1.25}) h / ${props.variant === 'vivid' ? 0.85 : 0.7})`,
    ]),
  ),
)
</script>

<template>
  <div aria-hidden="true" :class="cn('pointer-events-none absolute inset-0 overflow-hidden', props.class)">
    <Transition
      enter-active-class="transition-opacity duration-[1.2s] ease-linear"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-[1.2s] ease-linear"
      leave-to-class="opacity-0"
    >
      <Aurora v-if="palette.length" :key="src" class="absolute inset-0" :style="lights" />
    </Transition>
  </div>
</template>
