<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { paletteOf } from '../image-aurora/palette'

/**
 * Lab: loading as a photo developing, against the usual grey skeleton. While it loads, the card
 * shows a soft wash of what is coming: a tiny copy of the photo blown up and blurred (as a
 * BlurHash), and its lines as faint, out-of-focus tints of that photo rather than grey bars. Once it has
 * arrived, the photo and the words come up out of that wash into focus, a little over-exposed at
 * first and settling, as a print in the tray. `look="skeleton"` shows today's usual way instead.
 */
const props = defineProps<{ id: number; look: 'develop' | 'skeleton' }>()

const loaded = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
function reload() {
  loaded.value = false
  clearTimeout(timer)
  timer = setTimeout(() => (loaded.value = true), 1600)
}
reload()
onBeforeUnmount(() => clearTimeout(timer))
defineExpose({ reload })

const full = `https://picsum.photos/id/${props.id}/800/600`
// What a server would send with the card, before the photo: a few pixels of it.
const tiny = `https://picsum.photos/id/${props.id}/16/12`
// Its main colour, which tints the lines while the words are on their way.
const tint = ref('var(--color-bg-muted)')
paletteOf(tiny, 1).then(
  ([c]) => c && (tint.value = c),
  () => {},
)
</script>

<template>
  <article class="overflow-hidden rounded-[24px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
    <div class="relative aspect-[4/3] overflow-hidden">
      <template v-if="look === 'develop'">
        <!-- The wash: the tiny copy, blurred and blown up past its edges. -->
        <img :src="tiny" alt="" class="absolute inset-0 size-full scale-110 object-cover blur-xl" />
        <img
          v-if="loaded"
          :src="full"
          alt=""
          class="absolute inset-0 size-full object-cover animate-[lab-develop_0.9s_var(--ease-soft)_both]"
        />
      </template>
      <template v-else>
        <div v-if="!loaded" class="absolute inset-0 animate-pulse bg-bg-muted" />
        <img v-else :src="full" alt="" class="absolute inset-0 size-full object-cover animate-blur-in" />
      </template>
    </div>
    <div class="p-5">
      <template v-if="!loaded">
        <!-- Develop: tints of the photo's own wash; skeleton: grey bars. -->
        <div v-if="look === 'develop'" class="flex flex-col gap-2.5">
          <div
            v-for="w in ['w-1/4 h-3', 'w-2/3 h-5', 'w-11/12 h-3.5']"
            :key="w"
            :class="['rounded-full blur-[2px]', w]"
            :style="{ background: `color-mix(in oklab, ${tint} 30%, transparent)` }"
          />
        </div>
        <div v-else class="flex flex-col gap-2.5">
          <div class="h-3 w-1/4 animate-pulse rounded-full bg-bg-muted" />
          <div class="h-5 w-2/3 animate-pulse rounded-full bg-bg-muted" />
          <div class="h-3.5 w-11/12 animate-pulse rounded-full bg-bg-muted" />
        </div>
      </template>
      <div
        v-else
        :class="look === 'develop' ? 'animate-[lab-develop-text_0.9s_var(--ease-soft)_0.1s_both]' : 'stagger-children'"
      >
        <p class="text-xs font-medium text-fg-muted">Photography</p>
        <h3 class="mt-1 text-lg font-semibold text-fg">A season in the mountains</h3>
        <p class="mt-2 text-sm text-fg-secondary">Twelve walks, one camera, and the light of each month.</p>
      </div>
    </div>
  </article>
</template>

<style>
@keyframes lab-develop {
  from {
    opacity: 0;
    filter: blur(16px) brightness(1.25) saturate(0.7);
  }
  60% {
    opacity: 1;
  }
}
@keyframes lab-develop-text {
  from {
    opacity: 0;
    filter: blur(6px);
  }
}
</style>
