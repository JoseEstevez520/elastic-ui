<script setup lang="ts">
import { TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText, TagsInputRoot } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { XIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { useFieldControl } from '../../utils/field'
import { labelFor } from '../../utils/labels'
import { tagsInputClass, tagsInputDeleteClass, tagsInputItemClass } from './tags-input.variants'

/**
 * A few words as tags: labels, keywords, emails. What is typed becomes its tag where it stands on
 * Enter, a comma or a paste; a tag taken away (its cross, or Backspace twice) folds up and the rest
 * slide over into its room.
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

// A tag leaving folds its room while it blurs away, so the ones after it slide over rather than
// jump. Its width is fixed first, as `auto` cannot be eased from.
function leave(el: Element, done: () => void) {
  const tag = el as HTMLElement
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return done()
  tag.style.width = `${tag.offsetWidth}px`
  tag.style.transition =
    'width 300ms var(--ease-emphasized), padding 300ms var(--ease-emphasized), margin 300ms var(--ease-emphasized), opacity 200ms linear, filter 200ms linear'
  void tag.offsetWidth
  Object.assign(tag.style, {
    width: '0px',
    paddingInline: '0px',
    marginInline: '-3px',
    opacity: '0',
    filter: 'blur(2px)',
  })
  setTimeout(done, 300)
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
      <TagsInputItem v-for="tag in tags" :key="tag" :value="tag" :class="tagsInputItemClass">
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
