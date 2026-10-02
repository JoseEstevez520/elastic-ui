<script setup lang="ts">
import { PopoverAnchor, PopoverContent, PopoverPortal, PopoverRoot } from 'reka-ui'
import { nextTick, onUpdated, useId, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { cn } from '../../utils/cn'
import { labelFor } from '../../utils/labels'
import { floatingPanelClass } from '../popover/popover.variants'
import { provideSuggestionMenuContext } from './suggestion-menu.context'
import { suggestionMenuContentClass, suggestionMenuListClass } from './suggestion-menu.variants'

/**
 * A list of suggestions at a point in some text, as Notion's "/" menu: what was typed is filtered
 * by the app, which puts the matching SuggestionMenuItems in the slot. It never takes the focus,
 * so the text keeps its caret and the typing goes on; the app passes it the arrows and Enter
 * (`next`, `previous`, `pick`). It opens under the point, or over it near the bottom of the
 * screen, and appears and goes at once, as a menu used many times a minute does.
 *
 * `reference` is where the point is on screen (the caret's box, a `DOMRect`). Escape and a
 * click elsewhere close it.
 */
const props = withDefaults(
  defineProps<{
    /** Where the point is on screen; the menu follows it as it moves. */
    reference?: DOMRect | null
    /** Its name for screen readers. */
    label?: string
    class?: HTMLAttributes['class']
  }>(),
  { reference: null, label: labelFor('suggestions') },
)

const emit = defineEmits<{ select: [value: string] }>()

const open = defineModel<boolean>('open', { default: false })
/** The value of the highlighted item: the first one, until the keys or the pointer move it. */
const highlighted = defineModel<string>()

// A point on screen, as the positioning wants it: read each time, so it follows the caret.
const anchor = {
  getBoundingClientRect: () => props.reference ?? new DOMRect(),
}

const baseId = useId()
const idOf = (value: string) => `${baseId}-${value}`

const list = useTemplateRef<HTMLElement>('list')
const values = () =>
  [...(list.value?.querySelectorAll<HTMLElement>('[data-suggestion-value]:not([data-disabled])') ?? [])].map(
    (el) => el.dataset.suggestionValue!,
  )

// The items change with every key: when the highlighted one is gone, the first one takes it.
function settle() {
  const all = values()
  if (!all.length) highlighted.value = undefined
  else if (!highlighted.value || !all.includes(highlighted.value)) highlighted.value = all[0]
}
onUpdated(settle)
watch(open, (isOpen) => isOpen && nextTick(settle))

// Kept in view inside the list only: the page itself never moves (`scrollIntoView` would).
watch(highlighted, async (value) => {
  await nextTick()
  const box = list.value
  const item = value ? box?.querySelector<HTMLElement>(`#${CSS.escape(idOf(value))}`) : null
  if (!box || !item) return
  const boxRect = box.getBoundingClientRect()
  const itemRect = item.getBoundingClientRect()
  if (itemRect.top < boxRect.top) box.scrollTo({ top: box.scrollTop - (boxRect.top - itemRect.top) - 4 })
  else if (itemRect.bottom > boxRect.bottom) box.scrollTo({ top: box.scrollTop + (itemRect.bottom - boxRect.bottom) + 4 })
})

function move(step: number) {
  const all = values()
  if (!all.length) return
  const at = highlighted.value ? all.indexOf(highlighted.value) : -1
  highlighted.value = all[(at + step + all.length) % all.length]
}

function select(value: string) {
  emit('select', value)
}

provideSuggestionMenuContext({ highlighted, idOf, select })

defineExpose({
  /** Highlights the next item, wrapping round to the first. */
  next: () => move(1),
  /** Highlights the previous item, wrapping round to the last. */
  previous: () => move(-1),
  /** Selects the highlighted item; false when there is none to pick. */
  pick: () => {
    if (!highlighted.value) return false
    select(highlighted.value)
    return true
  },
  /** The highlighted item's id, for the text's `aria-activedescendant`. */
  activeId: () => (highlighted.value ? idOf(highlighted.value) : undefined),
})
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverAnchor :reference="anchor" />
    <PopoverPortal>
      <PopoverContent
        side="bottom"
        align="start"
        :side-offset="6"
        :collision-padding="16"
        update-position-strategy="always"
        :class="cn(floatingPanelClass, suggestionMenuContentClass, 'data-[state=open]:animate-none data-[state=closed]:animate-none', props.class)"
        @open-auto-focus.prevent
        @close-auto-focus.prevent
      >
        <div :id="baseId" ref="list" role="listbox" :aria-label="label" :class="suggestionMenuListClass">
          <slot />
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
