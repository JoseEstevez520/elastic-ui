<script setup lang="ts">
import { CollapsibleRoot, useForwardPropsEmits, type CollapsibleRootEmits, type CollapsibleRootProps } from 'reka-ui'

/**
 * One section that opens to show more. The header stays put, the section grows out of it and
 * the content fades in. Behavior and accessibility come from Reka UI.
 */
const props = defineProps<Omit<CollapsibleRootProps, 'unmountOnHide'>>()
const emits = defineEmits<CollapsibleRootEmits>()

// Forwards only the props the parent actually passed, so an absent `open` stays uncontrolled
// instead of being cast to `false`.
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <!-- Kept mounted while closed, as `hidden="until-found"`: the browser's find-in-page can
       still reach the content and opens the section when it does. -->
  <CollapsibleRoot v-bind="forwarded" :unmount-on-hide="false">
    <slot />
  </CollapsibleRoot>
</template>
