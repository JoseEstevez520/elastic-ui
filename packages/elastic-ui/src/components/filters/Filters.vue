<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import { computed, nextTick, ref, useTemplateRef, watch, type HTMLAttributes } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, FilterIcon, SearchIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { labelFor, useLabels } from '../../utils/labels'
import { contentOut } from '../../utils/motion'
import { matchesQuery } from '../../utils/search'
import AnimatedList from '../animated-list/AnimatedList.vue'
import Checkbox from '../checkbox/Checkbox.vue'
import Input from '../input/Input.vue'
import PopoverMorph from '../popover-morph/PopoverMorph.vue'
import TextMorph from '../text-morph/TextMorph.vue'
import FiltersPill from './FiltersPill.vue'
import {
  filtersClass,
  filtersHeaderClass,
  filtersHeadingClass,
  filtersListClass,
  filtersOptionClass,
  filtersOptionCountClass,
  filtersRowClass,
  filtersRowCountClass,
  filtersRowIconClass,
  filtersSummaryClass,
  type FilterCategory,
  type FilterValue,
} from './filters.variants'

/**
 * Filters as Linear and Notion have them. A button grows into a panel of categories (as
 * PopoverMorph); choosing one turns the panel to its options, the box easing to their height.
 * What is chosen stands beside the button as a pill, its values morphing as they change; pressing
 * a pill opens the panel at its category, its cross takes it away and the rest slide over. The
 * results are yours: bind `v-model` and filter them, and pass `count` to have it said.
 */
const props = withDefaults(
  defineProps<{
    categories: FilterCategory[]
    /** How many results the filters leave; said beside them, morphing as it changes. */
    count?: number
    /** The button's label and the panel's accessible name. */
    label?: string
    /** From how many options a category gets a search field. */
    searchFrom?: number
    class?: HTMLAttributes['class']
  }>(),
  { label: labelFor('filter'), searchFrom: 8 },
)

const selected = defineModel<FilterValue>({ default: () => ({}) })
const labels = useLabels()

const open = ref(false)
// The panel's page: the list of categories, or one category's options. With a single category
// there is no list to choose from: the panel is its options.
const single = computed(() => (props.categories.length === 1 ? props.categories[0]!.key : undefined))
const page = ref<string>()
const category = computed(() => props.categories.find((c) => c.key === (single.value ?? page.value)))

// The button opens the categories; a pill opens its own.
function openAt(key?: string) {
  page.value = key
  open.value = true
}
watch(open, (isOpen) => !isOpen && (query.value = ''))

const panel = useTemplateRef<HTMLElement>('panel')
// Turning the page moves focus into it, as opening does: to its search field when it has one,
// ready to type, or else to its first row.
async function turn(key?: string) {
  page.value = key
  query.value = ''
  await nextTick()
  const into = panel.value?.querySelector<HTMLElement>('input') ?? panel.value?.querySelector<HTMLElement>('button')
  into?.focus({ preventScroll: true })
}

const query = ref('')
const searchable = computed(() => (category.value?.options.length ?? 0) >= props.searchFrom)
const options = computed(() =>
  (category.value?.options ?? []).filter((o) => !query.value || matchesQuery(query.value, o.label, [o.value])),
)

const isOn = (key: string, value: string) => selected.value[key]?.includes(value) ?? false
function toggle(key: string, value: string, on: boolean) {
  const values = (selected.value[key] ?? []).filter((v) => v !== value)
  if (on) values.push(value)
  const next = { ...selected.value }
  if (values.length) next[key] = values
  else delete next[key]
  selected.value = next
}
function remove(key: string) {
  const next = { ...selected.value }
  delete next[key]
  selected.value = next
}
const clear = () => (selected.value = {})

// The pills, in the categories' order, each saying its values; past two, how many more.
const pills = computed(() =>
  props.categories
    .filter((c) => selected.value[c.key]?.length)
    .map((c) => {
      const names = selected.value[c.key]!.map((v) => c.options.find((o) => o.value === v)?.label ?? v)
      const values = names.length > 2 ? `${names.slice(0, 2).join(', ')} +${names.length - 2}` : names.join(', ')
      return { key: c.key, category: c.label, values }
    }),
)

const summary = computed(() =>
  props.count === undefined
    ? undefined
    : props.count === 1
      ? labels.oneResult
      : labels.results.replace('{count}', String(props.count)),
)
</script>

<template>
  <div :class="cn(filtersClass, props.class)">
    <!-- The panel's own padding is left to its parts: a header and lists. -->
    <PopoverMorph v-model:open="open" :label="label" class="p-0">
      <template #trigger>
        <FilterIcon aria-hidden="true" class="size-4" />
        {{ label }}
      </template>

      <div ref="panel">
        <!-- Keyed by page, so turning it brings the new one into focus. -->
        <div v-if="!category" key="categories" :class="cn(filtersListClass, 'animate-blur-in motion-reduce:animate-none')">
          <p :class="filtersHeadingClass">{{ labels.filterBy }}</p>
          <button v-for="c in categories" :key="c.key" type="button" :class="filtersRowClass" @click="turn(c.key)">
            <component :is="c.icon" v-if="c.icon" aria-hidden="true" :class="filtersRowIconClass" />
            {{ c.label }}
            <span v-if="selected[c.key]?.length" :class="filtersRowCountClass">{{ selected[c.key]!.length }}</span>
            <ChevronRightIcon aria-hidden="true" :class="cn(filtersRowIconClass, !selected[c.key]?.length && 'ml-auto')" />
          </button>
        </div>

        <div v-else :key="category.key" class="animate-blur-in motion-reduce:animate-none">
          <div v-if="!single || searchable" :class="filtersHeaderClass">
            <button v-if="!single" type="button" :class="cn(filtersRowClass, 'text-fg-muted')" @click="turn()">
              <ChevronLeftIcon aria-hidden="true" :class="filtersRowIconClass" />
              <span class="sr-only">{{ labels.back }}:</span>
              {{ category.label }}
            </button>
            <Input
              v-if="searchable"
              v-model="query"
              size="sm"
              :icon="SearchIcon"
              :placeholder="labels.searchPlaceholder"
              :aria-label="labels.search"
              :class="!single && 'mt-1'"
            />
          </div>
          <!-- A long list scrolls inside the panel, which keeps to the screen. -->
          <div :class="cn(filtersListClass, 'max-h-72 overflow-y-auto overscroll-contain scrollbar-subtle')">
            <div v-for="o in options" :key="o.value" :class="filtersOptionClass">
              <Checkbox
                :model-value="isOn(category.key, o.value)"
                class="min-w-0 flex-1"
                @update:model-value="toggle(category.key, o.value, $event === true)"
              >
                {{ o.label }}
              </Checkbox>
              <span v-if="o.count !== undefined" :class="filtersOptionCountClass">{{ o.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </PopoverMorph>

    <!-- Pills there when the page loads (filters from a link) just show. -->
    <AnimatedList
      :items="pills"
      :item-key="(p) => p.key"
      as="div"
      :appear="false"
      collapse="horizontal"
      :class="cn(filtersClass, 'min-w-0 max-w-full')"
      item-class="min-w-0 max-w-full"
    >
      <template #default="{ item }">
        <FiltersPill :category="item.category" :values="item.values" @open="openAt(item.key)" @remove="remove(item.key)" />
      </template>
    </AnimatedList>

    <div :class="filtersSummaryClass">
      <TextMorph v-if="summary" :text="summary" role="status" />
      <AnimatePresence :initial="false">
        <motion.button
          v-if="pills.length"
          type="button"
          :exit="{ opacity: 0, transition: contentOut }"
          class="cursor-pointer rounded-[var(--radius-sm)] text-fg-muted transition-colors hover:text-fg focus-ring"
          @click="clear"
        >
          {{ labels.clearFilters }}
        </motion.button>
      </AnimatePresence>
    </div>
  </div>
</template>
