<script setup lang="ts">
import { computed, type Component, type HTMLAttributes } from 'vue'
import { LanguagesIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import { PopoverMorph, PopoverMorphItem } from '../popover-morph'
import type { PopoverMorphTriggerVariants } from '../popover-morph/popover-morph.variants'

export interface LanguageOption {
  /** What the app keeps: `es`, `en`, `pt-BR`. It is also the item's `lang`. */
  code: string
  /** The language in its own words ("Español", "English"), never in the page's. */
  label: string
  /** A mark for it, such as a flag; the library ships no icons, so the project brings them. */
  icon?: Component
}

/**
 * Picks the language of a page, in the quiet way a header has room for: an icon that unfolds
 * into the languages (PopoverMorph, as a menu). Each is named in its own language and carries its
 * `lang`, so a screen reader says it right. A flag stands for a country, not a language, so the
 * names are shown by default; `labels="hidden"` keeps them for screen readers and as a tooltip and
 * leaves only the marks, for a header with two languages that anyone can tell apart.
 *
 * It only says which was picked (`v-model`): keeping it, and reloading with it, is the app's.
 */
const props = withDefaults(
  defineProps<{
    languages: LanguageOption[]
    /** `shown`: each option names its language. `hidden`: only its mark, the name kept for screen readers and the tooltip. */
    labels?: 'shown' | 'hidden'
    /** The button's look at rest, and its size: a ghost icon by default, as the theme toggle beside it. */
    variant?: PopoverMorphTriggerVariants['variant']
    size?: PopoverMorphTriggerVariants['size']
    align?: 'start' | 'end'
    /** Accessible name of the menu. */
    label?: string
    /** Applied to the panel. */
    class?: HTMLAttributes['class']
  }>(),
  { labels: 'shown', variant: 'ghost', size: 'icon', align: 'end', label: labelFor('language') },
)

const model = defineModel<string>()
const current = computed(() => props.languages.find((language) => language.code === model.value))

// Choosing the language already in use changes nothing.
function pick(code: string) {
  if (code !== model.value) model.value = code
}
// The panel is as wide as what it holds: one mark, or the names.
const width = computed(() => (props.labels === 'hidden' ? '3.5rem' : '11rem'))
</script>

<template>
  <PopoverMorph
    role="menu"
    :variant="variant"
    :size="size"
    :align="align"
    :label="label"
    :class="props.class"
    :style="{ '--popover-width': width }"
  >
    <template #trigger>
      <slot name="trigger" :current="current">
        <LanguagesIcon class="size-[18px]" :stroke-width="1.5" aria-hidden="true" />
        <span class="sr-only">{{ current?.label ?? label }}</span>
      </slot>
    </template>
    <PopoverMorphItem
      v-for="language in languages"
      :key="language.code"
      :icon="language.icon"
      :lang="language.code"
      :title="labels === 'hidden' ? language.label : undefined"
      :aria-current="language.code === model ? 'true' : undefined"
      :class="cn(labels === 'hidden' && 'justify-center', language.code === model && 'bg-bg-muted')"
      @select="pick(language.code)"
    >
      <span :class="cn(labels === 'hidden' && 'sr-only', language.code === model && 'font-medium')">{{ language.label }}</span>
    </PopoverMorphItem>
  </PopoverMorph>
</template>
