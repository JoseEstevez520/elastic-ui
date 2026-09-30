<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import { useSheetFlowContext } from './sheet-flow.context'

/**
 * One step of a SheetFlow, in the order written. Its title goes on the sheet's bar, morphing from
 * the last step's; its content is on show only while it is the step. The slot is given `next`,
 * `back` and `finish`.
 */
const props = defineProps<{ title: string }>()
const flow = useSheetFlowContext()
// Its place is where it stands among the steps set up, in the order written; each step mounts
// again whenever the sheet opens, and leaves the list as it unmounts.
const id = Symbol()
flow.titles.value.push({ id, title: props.title })
onBeforeUnmount(() => (flow.titles.value = flow.titles.value.filter((t) => t.id !== id)))
const place = computed(() => flow.titles.value.findIndex((t) => t.id === id))
const current = computed(() => flow.shown.value === place.value)
</script>

<template>
  <!-- Mounted afresh as it becomes the step, so it comes into focus as a wave, once the sheet's
       height is on its way. -->
  <div v-if="current" class="stagger-children [--stagger-delay:0.22s]">
    <slot :next="flow.next" :back="flow.back" :finish="flow.finish" />
  </div>
</template>
