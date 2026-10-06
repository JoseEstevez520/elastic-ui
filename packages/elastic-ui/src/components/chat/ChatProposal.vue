<script setup lang="ts">
import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger } from 'reka-ui'
import { computed, inject, nextTick, ref, useSlots, useTemplateRef, watch, type Component, type HTMLAttributes } from 'vue'
import { CheckIcon, ChevronRightIcon, EditIcon, ReplayIcon, XIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { labelFor, useLabels } from '../../utils/labels'
import Button from '../button/Button.vue'
import ConfirmButton from '../confirm-button/ConfirmButton.vue'
import DescriptionItem from '../description-list/DescriptionItem.vue'
import DescriptionList from '../description-list/DescriptionList.vue'
import Input from '../input/Input.vue'
import Textarea from '../input/Textarea.vue'
import StatusText from '../status-text/StatusText.vue'
import Switch from '../switch/Switch.vue'
import Tooltip from '../tooltip/Tooltip.vue'
import { ChatThreadReadyKey } from './chat.keys'
import { chatToolContentClass, chatToolTriggerClass } from './chat.variants'

/**
 * A change an assistant proposes and the person decides on before anything runs: a line saying
 * what would happen ("Create a note"), the details it would do it with, and Confirm, Edit and
 * Cancel. Edit turns the details into fields in place; Confirm hands back the details as they
 * stand. It knows nothing of what runs them: the app sets `state` from its own request, and the
 * line follows, shimmering while it works and quieting into a line like a finished ChatTool once
 * done or cancelled, so what was decided stays in the conversation. Put it in ChatMessage's
 * `after` slot, under the answer, one per change.
 *
 * After Vercel AI Elements' Confirmation and the OpenAI Agents SDK's tool approvals, with the
 * details editable before confirming, as LangGraph's interrupts allow.
 */
const props = withDefaults(
  defineProps<{
    /** What it proposes, as a verb phrase. Change it as it goes ("Created a note") and it morphs. */
    label: string
    icon?: Component
    /** The details it would run with, key → value. Strings, numbers and booleans get their own field. */
    args?: Record<string, unknown>
    /** `proposed` waits for the person; then `working`, `done` or `error`, as the app's request goes. */
    state?: 'proposed' | 'working' | 'done' | 'error' | 'cancelled'
    /** It can't be undone: Confirm asks again, in the danger colour, before it goes. */
    destructive?: boolean
    confirmLabel?: string
    editLabel?: string
    revertLabel?: string
    cancelLabel?: string
    cancelledLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  {
    args: () => ({}),
    state: 'proposed',
    confirmLabel: labelFor('confirm'),
    editLabel: labelFor('edit'),
    revertLabel: labelFor('revertEdits'),
    cancelLabel: labelFor('cancel'),
    cancelledLabel: labelFor('statusCancelled'),
  },
)
const emit = defineEmits<{ confirm: [args: Record<string, unknown>]; cancel: [] }>()

/** Whether the details are fields. */
const editing = defineModel<boolean>('editing', { default: false })
/** Whether the result is out, once done or failed. */
const open = defineModel<boolean>('open', { default: false })

const slots = useSlots()
const labels = useLabels()
const root = useTemplateRef<HTMLElement>('root')
const actions = useTemplateRef<HTMLElement>('actions')

// A proposal arriving in a conversation already on screen comes into focus; one there when it
// opened just shows.
const arrived = inject(ChatThreadReadyKey, ref(true)).value

const deciding = computed(() => props.state === 'proposed' || props.state === 'error')
// What was decided stays as a line: the details fold away once it is done or dropped.
const settled = computed(() => props.state === 'done' || props.state === 'cancelled')
const expandable = computed(() => (props.state === 'done' || props.state === 'error') && !!slots.default)

// --- The details, shown and edited ------------------------------------------------------------

type Kind = 'line' | 'text' | 'number' | 'boolean' | 'json'
const kindOf = (value: unknown): Kind => {
  if (typeof value === 'string') return value.includes('\n') || value.length > 60 ? 'text' : 'line'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  return 'json'
}

// What was last confirmed, edited or not, so the details shown while it runs are the ones sent.
const sent = ref<Record<string, unknown>>()
watch(
  () => props.args,
  () => (sent.value = undefined),
)
const shown = computed(() => sent.value ?? props.args)
const entries = computed(() => Object.entries(shown.value).map(([key, value]) => ({ key, value, kind: kindOf(value) })))

const shownText = (value: unknown, kind: Kind) =>
  kind === 'json' ? JSON.stringify(value) : typeof value === 'boolean' ? String(value) : String(value ?? '')
const isLong = (text: string) => text.length > 240 || text.split('\n').length > 4

// While editing, each detail is held as its field holds it (JSON as text) and typed back on confirm.
// Typed loosely: each field writes the type its own kind holds.
const draft = ref<Record<string, any>>({})
const startDraft = () => {
  draft.value = Object.fromEntries(
    entries.value.map(({ key, value, kind }) => [
      key,
      kind === 'json' ? JSON.stringify(value, null, 2) : (value as string | number | boolean),
    ]),
  )
}
const typedBack = (key: string, kind: Kind): { value: unknown; ok: boolean } => {
  const held = draft.value[key]
  if (kind === 'number') {
    const value = typeof held === 'number' ? held : Number(held)
    return { value, ok: held !== '' && Number.isFinite(value) }
  }
  if (kind === 'json') {
    try {
      return { value: JSON.parse(String(held)), ok: true }
    } catch {
      return { value: held, ok: false }
    }
  }
  return { value: held, ok: true }
}
const invalid = computed(() =>
  editing.value ? new Set(entries.value.filter(({ key, kind }) => !typedBack(key, kind).ok).map((e) => e.key)) : new Set<string>(),
)

watch(
  editing,
  async (on, was) => {
    if (on === was) return
    if (on) startDraft()
    // Open from the start, it just shows: the focus is only moved for a change the person made.
    if (was === undefined) return
    // Read before the fields go: the one holding the focus is about to unmount.
    const hadFocus = root.value?.contains(document.activeElement)
    await nextTick()
    // Into the first field on the way in; back to Edit on the way out, unless the focus was elsewhere.
    if (on) root.value?.querySelector<HTMLElement>('[data-proposal-field]')?.focus({ preventScroll: true })
    else if (hadFocus) root.value?.querySelector<HTMLElement>('[data-proposal-edit]')?.focus({ preventScroll: true })
  },
  { immediate: true },
)

function confirm() {
  if (!deciding.value || invalid.value.size) return
  const args = editing.value
    ? Object.fromEntries(entries.value.map(({ key, kind }) => [key, typedBack(key, kind).value]))
    : { ...shown.value }
  sent.value = args
  editing.value = false
  emit('confirm', args)
}
// On the surface, a ghost's hover would be its own tone: a tone deeper instead.
const actionClass = 'hover:bg-[color:var(--color-surface-sunk)]'
const toggleEditing = () => (editing.value = !editing.value)
function onEscape(event: KeyboardEvent) {
  if (!editing.value) return
  // Leaves the edit, not whatever holds the conversation (a ChatMorph closing on Escape).
  event.stopPropagation()
  editing.value = false
}

// --- Focus and what is said --------------------------------------------------------------------

// The actions leave as soon as it is confirmed or cancelled: focus that was on them stays in the
// proposal rather than falling to the page.
watch(deciding, async (now) => {
  if (now) return
  const hadFocus = actions.value?.contains(document.activeElement) || root.value?.querySelector('[data-proposal-field]:focus')
  await nextTick()
  if (hadFocus) root.value?.focus({ preventScroll: true })
})

const announcement = computed(() => {
  switch (props.state) {
    case 'working':
      return `${props.label}: ${labels.statusWorking}`
    case 'done':
      return `${props.label}: ${labels.statusDone}`
    case 'error':
      return `${props.label}: ${labels.statusError}`
    case 'cancelled':
      return `${props.label}: ${props.cancelledLabel}`
    default:
      return ''
  }
})
</script>

<template>
  <div
    ref="root"
    role="group"
    :aria-label="label"
    tabindex="-1"
    :data-state="state"
    :class="
      cn(
        'mt-3 rounded-[var(--chat-proposal-radius,var(--radius-xl))] px-3 py-2.5 text-ui whitespace-normal outline-none',
        'transition-[background-color] duration-300 ease-emphasized motion-reduce:transition-none',
        // A decision waiting is something to act on, so it takes a surface; once settled it is a line.
        settled ? 'bg-transparent' : 'bg-[color:var(--chat-proposal-bg,var(--color-surface))]',
        // Set into it, as in a Card: its fields a tone deeper, and the quiet actions' hover too.
        '[--input-bg:var(--color-surface-sunk)]',
        arrived && 'animate-blur-in motion-reduce:animate-none',
        props.class,
      )
    "
    @keydown.esc="onEscape"
  >
    <CollapsibleRoot v-model:open="open" :disabled="!expandable" :unmount-on-hide="false">
      <!-- From the top: a label can wrap, and the icon stays by its first line. -->
      <CollapsibleTrigger :class="[chatToolTriggerClass, 'items-start']" :tabindex="expandable ? undefined : -1">
        <component :is="icon" v-if="icon" aria-hidden="true" class="mt-[0.2em] size-4 shrink-0 text-fg-muted" />
        <StatusText
          :text="label"
          :working="state === 'working'"
          :class="[settled ? 'text-fg-muted' : 'text-fg', expandable && 'group-hover/tool:text-fg']"
        />
        <span v-if="state === 'cancelled'" class="mt-[0.15em] shrink-0 text-meta text-fg-faint animate-blur-in motion-reduce:animate-none">
          {{ cancelledLabel }}
        </span>
        <ChevronRightIcon
          aria-hidden="true"
          :class="[
            'mt-[0.25em] size-3.5 shrink-0 text-fg-faint transition-[opacity,rotate] duration-300 ease-emphasized motion-reduce:transition-none',
            expandable ? 'opacity-100' : 'opacity-0',
            open && 'rotate-90',
          ]"
        />
      </CollapsibleTrigger>

      <CollapsibleContent v-if="$slots.default" :class="chatToolContentClass">
        <!-- The result, or what went wrong: what it holds brings its own entrance. -->
        <div class="pt-2 pb-1 [[data-state=closed]>&]:animate-[blur-out_0.35s_var(--ease-soft)_both] motion-reduce:animate-none">
          <slot />
        </div>
      </CollapsibleContent>

      <!-- The details, folding away once it is settled. -->
      <CollapsibleRoot :open="!settled && entries.length > 0" :unmount-on-hide="false">
        <CollapsibleContent :class="chatToolContentClass">
          <DescriptionList class="pt-1.5">
            <DescriptionItem
              v-for="{ key, value, kind } in entries"
              :key="key"
              :term="key"
              class="py-1.5 sm:grid-cols-[minmax(0,7rem)_1fr]"
            >
              <template v-if="editing">
                <Switch v-if="kind === 'boolean'" v-model="draft[key]" data-proposal-field>
                  <span class="sr-only">{{ key }}</span>
                </Switch>
                <Textarea
                  v-else-if="kind === 'text' || kind === 'json'"
                  v-model="draft[key]"
                  :aria-label="key"
                  :invalid="invalid.has(key)"
                  :class="kind === 'json' && 'font-mono text-meta'"
                  data-proposal-field
                />
                <Input
                  v-else
                  v-model="draft[key]"
                  :type="kind === 'number' ? 'number' : 'text'"
                  :aria-label="key"
                  :invalid="invalid.has(key)"
                  size="sm"
                  data-proposal-field
                  @keydown.enter.prevent="confirm"
                />
              </template>
              <span
                v-else
                :class="[
                  'block [overflow-wrap:anywhere] whitespace-pre-line',
                  kind === 'json' && 'font-mono text-meta',
                  isLong(shownText(value, kind)) && 'max-h-24 overflow-hidden mask-fade-b',
                ]"
              >{{ shownText(value, kind) }}</span>
            </DescriptionItem>
          </DescriptionList>
        </CollapsibleContent>
      </CollapsibleRoot>

      <!-- The decision: leaves while it runs and once settled, and comes back if it failed. -->
      <CollapsibleRoot :open="deciding" :unmount-on-hide="false">
        <CollapsibleContent :class="chatToolContentClass">
          <div ref="actions" class="-ml-2 flex flex-wrap items-center gap-1 pt-2" :inert="!deciding || undefined">
            <Tooltip v-if="destructive" :content="confirmLabel">
              <ConfirmButton
                :icon="CheckIcon"
                tone="danger"
                variant="ghost"
                :label="confirmLabel"
                :disabled="invalid.size > 0"
                @confirm="confirm"
              />
            </Tooltip>
            <Button v-else variant="ghost" size="sm" :class="actionClass" :icon="CheckIcon" :disabled="invalid.size > 0" @click="confirm">
              {{ confirmLabel }}
            </Button>
            <Tooltip v-if="entries.length" :content="editing ? revertLabel : editLabel">
              <Button
                data-proposal-edit
                variant="ghost"
                size="icon"
                :class="actionClass"
                :aria-label="editing ? revertLabel : editLabel"
                :aria-pressed="editing"
                @click="toggleEditing"
              >
                <component :is="editing ? ReplayIcon : EditIcon" aria-hidden="true" class="size-4" />
              </Button>
            </Tooltip>
            <Tooltip :content="cancelLabel">
              <Button variant="ghost" size="icon" :class="actionClass" :aria-label="cancelLabel" @click="emit('cancel')">
                <XIcon aria-hidden="true" class="size-4" />
              </Button>
            </Tooltip>
          </div>
        </CollapsibleContent>
      </CollapsibleRoot>

    </CollapsibleRoot>
    <span class="sr-only" aria-live="polite">{{ announcement }}</span>
  </div>
</template>
