<script setup lang="ts">
import { onBeforeUnmount, useId, useSlots, watchEffect } from 'vue'
import { useTourContext } from './tour.context'

/**
 * One step of a `Tour`. `target` names the `data-tour` attribute of the element it explains,
 * found live wherever it sits in the app; `to`, for a step on another screen, is whatever
 * `Tour`'s `beforeStep` needs to get there (a route, say) before it measures. Registers itself in
 * order as it mounts; no visible output of its own (the text shows in the travelling card).
 */
const props = defineProps<{
  target: string
  title: string
  /** Opaque to this part: an app with routes gives it what `Tour`'s `beforeStep` needs. */
  to?: unknown
}>()

const { ids, register, unregister } = useTourContext()
const slots = useSlots()
const id = useId()
ids.value.push(id)
watchEffect(() => register(id, { target: props.target, title: props.title, to: props.to, body: slots.default }))
onBeforeUnmount(() => {
  ids.value.splice(ids.value.indexOf(id), 1)
  unregister(id)
})
</script>

<template><span style="display: none" /></template>
