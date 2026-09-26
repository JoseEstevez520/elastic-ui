<script setup lang="ts">
import { TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText, TagsInputRoot } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { XIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { useFieldControl } from '../../utils/field'
import { labelFor } from '../../utils/labels'
import { contentOut, prefersReducedMotion } from '../../utils/motion'
import { placesOf, travel } from '../../utils/travel'
import { tagsInputClass, tagsInputDeleteClass, tagsInputItemClass } from './tags-input.variants'

/**
 * A few words as tags: labels, keywords, emails. What is typed becomes its tag where it stands on
 * Enter, a comma or a paste; a tag taken away (its cross, or Backspace twice) fades where it stands,
 * then the rest move into its room, as AnimatedList's items do.
 */
const props = withDefaults(
  defineProps<{
    placeholder?: string
    /** How many tags it takes at most. */
    max?: number
    /** What else, besides Enter, ends a tag. */
    delimiter?: string
    /** Let the same tag in twice. */
    duplicate?: boolean
    invalid?: boolean
    disabled?: boolean
    name?: string
    removeLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  { delimiter: ',', removeLabel: labelFor('remove') },
)

const tags = defineModel<string[]>({ default: () => [] })
const fieldAttrs = useFieldControl(() => props.invalid)

// A tag leaving goes as AnimatedList's items do: it fades where it stands, keeping its room, so
// nothing is squeezed; then its room goes and the rest move to their new places. Along one line
// they slide over; if any changes line, sliding would cut across the others, so all that move fade
// where they were and come into focus where they land, as a wave (`travel`).
const OUT = contentOut.duration * 1000
function leave(el: Element, done: () => void) {
  if (prefersReducedMotion()) return done()
  el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: OUT, easing: 'linear', fill: 'forwards' }).finished.then(
    () => {
      const others = el.parentElement?.querySelectorAll<HTMLElement>('[data-tag], input') ?? []
      const places = placesOf([...others].filter((o) => o !== el))
      done()
      travel(places)
    },
  )
}
</script>

<template>
  <TagsInputRoot
    v-model="tags"
    :max="max"
    :delimiter="delimiter"
    :duplicate="duplicate"
    :disabled="disabled"
    :name="name"
    add-on-paste
    add-on-blur
    :class="cn(tagsInputClass, props.class)"
  >
    <TransitionGroup :css="false" @leave="leave">
      <TagsInputItem v-for="tag in tags" :key="tag" :value="tag" data-tag :class="tagsInputItemClass">
        <TagsInputItemText class="truncate" />
        <TagsInputItemDelete :aria-label="`${removeLabel} ${tag}`" :class="tagsInputDeleteClass">
          <XIcon aria-hidden="true" class="size-3" />
        </TagsInputItemDelete>
      </TagsInputItem>
    </TransitionGroup>
    <TagsInputInput
      v-bind="fieldAttrs"
      :placeholder="tags.length ? undefined : placeholder"
      class="h-7 min-w-24 flex-1 bg-transparent outline-none placeholder:text-fg-faint"
    />
  </TagsInputRoot>
</template>
