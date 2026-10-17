<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { loadPart, type LoadedPart } from '../parts'

/**
 * One story alone on a page, for the iframe a story of the page itself is shown in (StoryFrame): a
 * header, a sidebar, a table of contents scroll, stick and break at the frame's width as they would
 * on a real page, which they cannot do inside a box on another page.
 */
const route = useRoute()
const loaded = shallowRef<LoadedPart>()
const component = computed(() => loaded.value?.components[String(route.params.story)])

// The page around the frame sets the theme; the frame follows it as it changes.
let observer: MutationObserver | undefined
onMounted(async () => {
  const host = window.parent !== window ? window.parent.document.documentElement : undefined
  if (host) {
    const follow = () => {
      if (host.dataset.theme) document.documentElement.dataset.theme = host.dataset.theme
      else delete document.documentElement.dataset.theme
    }
    follow()
    observer = new MutationObserver(follow)
    observer.observe(host, { attributes: true, attributeFilter: ['data-theme'] })
  }
  // A story drawn for a wider screen than this frame (a phone at 360px, on a narrower phone) is
  // shrunk to the frame's width rather than scrolled sideways, as StoryFrame does in its box;
  // checked again whenever the story changes size, since it may settle a while after mounting.
  resizer = new ResizeObserver(fit)
  resizer.observe(document.body)
  loaded.value = await loadPart(String(route.params.name))
})
onBeforeUnmount(() => {
  observer?.disconnect()
  resizer?.disconnect()
})

let resizer: ResizeObserver | undefined
function fit() {
  const page = document.documentElement
  const body = document.body
  const zoom = Number(body.style.zoom || 1)
  // The width the story asks for at full size, whatever it is shrunk to now.
  const wanted = page.scrollWidth / zoom
  const next = wanted > page.clientWidth + 1 ? Math.max(0.5, page.clientWidth / wanted) : 1
  if (Math.abs(next - zoom) > 0.01) body.style.zoom = next === 1 ? '' : String(next)
}
</script>

<template>
  <component :is="component" v-if="component" />
</template>
