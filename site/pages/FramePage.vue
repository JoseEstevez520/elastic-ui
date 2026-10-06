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
  loaded.value = await loadPart(String(route.params.name))
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <component :is="component" v-if="component" />
</template>
