<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { computed, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from 'elastic-ui'
import ApiTable from '../components/ApiTable.vue'
import StoryExample from '../components/StoryExample.vue'
import { loadPart, neighborsOf, type LoadedPart } from '../parts'

const route = useRoute()
const slug = computed(() => String(route.params.name))
const loaded = shallowRef<LoadedPart>()

// The slug is a route param: a new page can start loading while the previous one is still in
// flight, and only the last one to be asked for may land.
let token = 0
watch(
  slug,
  async (value) => {
    const mine = ++token
    const result = await loadPart(value)
    if (mine === token) loaded.value = result
  },
  { immediate: true },
)

const part = computed(() => loaded.value?.data)
const examples = computed(() => part.value?.stories.filter((story) => !story.situation) ?? [])
const situations = computed(() => part.value?.stories.filter((story) => story.situation) ?? [])
const neighbors = computed(() => neighborsOf(slug.value))

// One story lives on the page at once (SITE.md §5's own rule, taken further): with every other
// example, every situation and every sub-component's API always mounted too, a part with many of
// each (Sidebar's five, Select's ten-odd stories) got heavy to scroll — and a part whose story
// mounts something that answers to one shared state for the whole page rather than its own
// instance (Toast's queue) showed as many of it as there were stories open at once. Collapsed,
// only the main example actually renders.
const mainExample = computed(() => examples.value[0])
const restExamples = computed(() => examples.value.slice(1))
const moreCount = computed(() => restExamples.value.length + situations.value.length)
</script>

<template>
  <article v-if="part" class="prose article py-10">
    <h1>{{ part.name }}</h1>
    <p v-if="part.description">{{ part.description }}</p>
    <p v-for="credit in part.credits ?? []" :key="credit"><em>{{ credit }}</em></p>

    <StoryExample v-if="mainExample" :story="mainExample" :component="loaded?.components[mainExample.key]" />

    <Collapsible class="not-prose">
      <CollapsibleTrigger class="text-label text-fg-secondary hover:text-fg">
        {{ moreCount ? `Every example and the API (${moreCount} more)` : 'The API' }}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <StoryExample
          v-for="story in restExamples"
          :key="story.key"
          :story="story"
          :component="loaded?.components[story.key]"
        />

        <template v-if="situations.length">
          <h2>Situations</h2>
          <p>
            A part is not done until it works in each of these situations, and each keeps its own story so it keeps
            being checked. They are the part's behavior, not examples to copy.
          </p>
          <StoryExample
            v-for="story in situations"
            :key="story.key"
            :story="story"
            :component="loaded?.components[story.key]"
            :level="3"
          />
        </template>

        <h2>API</h2>
        <ApiTable v-for="apiPart in part.api" :key="apiPart.name" :part="apiPart" :named="part.api.length > 1" />
      </CollapsibleContent>
    </Collapsible>

    <nav v-if="neighbors.previous || neighbors.next" class="not-prose mt-16 flex items-center gap-4 border-t border-border pt-6">
      <Button v-if="neighbors.previous" variant="ghost" :icon="ChevronLeft" :to="`/components/${neighbors.previous.slug}`">
        {{ neighbors.previous.name }}
      </Button>
      <Button v-if="neighbors.next" variant="ghost" :to="`/components/${neighbors.next.slug}`" class="ml-auto">
        {{ neighbors.next.name }}
        <ChevronRight class="size-4" aria-hidden="true" />
      </Button>
    </nav>
  </article>
</template>
