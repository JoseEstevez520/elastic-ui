<script setup lang="ts">
import { Toggle } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import IconMorph from '../icon-morph/IconMorph.vue'
import type { IconMorphName } from '../icon-morph'
import { toggleVariants, type ToggleSize } from './toggle.variants'

/**
 * A button that stays pressed until pressed again (bold, mute, play), shown by tone: pressed, it
 * stands on the raised tone. With `icon` and `pressedIcon`, one IconMorph glyph turns into the
 * other as it is pressed (play into pause), rather than one icon swapping for another. Name it with
 * `aria-label` when it only has an icon. Behavior and `aria-pressed` come from Reka UI.
 */
const props = withDefaults(
  defineProps<{
    icon?: IconMorphName
    /** The glyph it morphs into while pressed; the same `icon` if left out. */
    pressedIcon?: IconMorphName
    size?: ToggleSize
    disabled?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { size: 'md' },
)
const pressed = defineModel<boolean>({ default: false })
const glyph = computed(() => (pressed.value && props.pressedIcon ? props.pressedIcon : props.icon))
</script>

<template>
  <Toggle v-model="pressed" :disabled="disabled" :class="cn(toggleVariants({ size }), props.class)">
    <IconMorph v-if="glyph" :icon="glyph" />
    <slot />
  </Toggle>
</template>
