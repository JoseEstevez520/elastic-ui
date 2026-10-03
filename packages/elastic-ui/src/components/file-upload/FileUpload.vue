<script setup lang="ts">
import { computed, ref, useTemplateRef, type HTMLAttributes } from 'vue'
import { CheckIcon, ExclamationIcon as AlertMarkIcon, UploadIcon, XIcon } from '../../icons/internal'
import { cn } from '../../utils/cn'
import { useFieldControl } from '../../utils/field'
import { labelFor, useLabels } from '../../utils/labels'
import FileIcon from '../file-icon/FileIcon.vue'
import { progressFillVariants } from '../progress-button/progress-button.variants'
import TextMorph from '../text-morph/TextMorph.vue'
import type { Uploader, UploadFile } from './file-upload.types'
import { compactZoneClass, dropZoneClass, fileRowClass } from './file-upload.variants'

/**
 * Files dropped on it, or chosen from the button it is. Each file becomes its row, opening its room
 * under the zone and coming into focus; with `upload`, the row is its own progress, filling from
 * the left as the file goes up, and its icon turns into a check (or what went wrong). A row taken
 * away fades where it is, then its room folds up. The list is `v-model`; without `upload`, files are just listed, for a form.
 *
 * `compact` drops the big zone for a small "Choose files" action, for inside a panel; the rows are
 * the same. Files that arrive from elsewhere (a FileDropZone over the page, a paste) go in through
 * the exposed `add`.
 */
const props = withDefaults(
  defineProps<{
    /** As the file input's: `image/*`, `.pdf`… */
    accept?: string
    multiple?: boolean
    /** The largest a file may be, in bytes. */
    maxSize?: number
    upload?: Uploader
    invalid?: boolean
    disabled?: boolean
    /** A small action in place of the dashed zone, for a panel or a bar. */
    compact?: boolean
    /** The zone's words, at rest. */
    dropLabel?: string
    removeLabel?: string
    /** The compact action's words. */
    chooseLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  {
    multiple: true,
    dropLabel: labelFor('dropFiles'),
    removeLabel: labelFor('remove'),
    chooseLabel: labelFor('chooseFiles'),
  },
)

const files = defineModel<UploadFile[]>({ default: () => [] })
const labels = useLabels()
const fieldAttrs = useFieldControl(() => props.invalid)

const size = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  const units = ['kilobyte', 'megabyte', 'gigabyte'] as const
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)) - 1)
  const value = bytes / 1024 ** (i + 1)
  return new Intl.NumberFormat(undefined, {
    style: 'unit',
    unit: units[i],
    unitDisplay: 'short',
    maximumFractionDigits: value < 10 ? 1 : 0,
  }).format(value)
}

// As the file input's `accept`, which a drop does not go through: extensions and types, `image/*`.
const accepted = (file: File) =>
  !props.accept ||
  props.accept.split(',').some((rule) => {
    const r = rule.trim().toLowerCase()
    if (r.startsWith('.')) return file.name.toLowerCase().endsWith(r)
    if (r.endsWith('/*')) return file.type.startsWith(r.slice(0, -1))
    return file.type === r
  })

const update = (id: string, patch: Partial<UploadFile>) =>
  (files.value = files.value.map((f) => (f.id === id ? { ...f, ...patch } : f)))
const remove = (id: string) => (files.value = files.value.filter((f) => f.id !== id))

let count = 0
function add(list: FileList | File[] | null) {
  if (!list?.length || props.disabled) return
  const added = [...list].slice(0, props.multiple ? undefined : 1).map<UploadFile>((file) => {
    const tooLarge = props.maxSize !== undefined && file.size > props.maxSize
    const refused = !accepted(file)
    return {
      id: `${Date.now()}-${count++}`,
      name: file.name,
      size: file.size,
      file,
      status: tooLarge || refused ? 'error' : props.upload ? 'uploading' : 'done',
      progress: 0,
      error: refused
        ? labels.notAccepted
        : tooLarge
          ? labels.tooLarge.replace('{size}', size(props.maxSize!))
          : undefined,
    }
  })
  files.value = props.multiple ? [...files.value, ...added] : added
  for (const item of added) if (item.status === 'uploading') send(item)
}
async function send(item: UploadFile) {
  try {
    await props.upload!(item.file!, (fraction) => update(item.id, { progress: Math.min(1, Math.max(0, fraction)) }))
    update(item.id, { status: 'done', progress: 1 })
  } catch (error) {
    update(item.id, {
      status: 'error',
      error: error instanceof Error && error.message ? error.message : labels.uploadFailed,
    })
  }
}

// Files held over the zone. Entering and leaving fire for every element inside it, so they are
// counted rather than toggled.
const depth = ref(0)
const over = computed(() => depth.value > 0)
function onDrop(event: DragEvent) {
  depth.value = 0
  if (!props.disabled) add(event.dataTransfer?.files ?? null)
}

defineExpose({ add })

const input = useTemplateRef<HTMLInputElement>('input')
function onPick() {
  add(input.value?.files ?? null)
  if (input.value) input.value.value = ''
}
</script>

<template>
  <div :class="cn('flex w-full flex-col gap-2', props.class)">
    <button
      type="button"
      v-bind="fieldAttrs"
      :disabled="disabled"
      :data-over="over"
      :class="compact ? compactZoneClass : dropZoneClass"
      @click="input?.click()"
      @dragenter.prevent="depth++"
      @dragleave="depth = Math.max(0, depth - 1)"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      <UploadIcon aria-hidden="true" :class="compact ? 'size-4' : 'size-5'" />
      <TextMorph :text="over ? labels.dropToAdd : compact ? chooseLabel : dropLabel" />
    </button>
    <input
      ref="input"
      type="file"
      class="hidden"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      @change="onPick"
    />

    <TransitionGroup
      tag="ul"
      class="flex flex-col"
      enter-from-class="grid-rows-[0fr] opacity-0 blur-[2px]"
      enter-to-class="grid-rows-[1fr]"
      leave-from-class="grid-rows-[1fr]"
      leave-to-class="grid-rows-[0fr] opacity-0"
      enter-active-class="transition-[grid-template-rows,opacity,filter] duration-[400ms] ease-emphasized motion-reduce:transition-none"
      leave-active-class="[transition:opacity_160ms_linear,grid-template-rows_300ms_var(--ease-emphasized)_160ms] motion-reduce:transition-none"
    >
      <li v-for="f in files" :key="f.id" class="grid">
        <div class="overflow-hidden">
          <div :class="fileRowClass">
            <!-- Done, it turns green where it stands, then fades a moment later, leaving the check. -->
            <span
              v-if="upload && f.status !== 'error'"
              aria-hidden="true"
              :class="
                f.status === 'done'
                  ? cn(
                      progressFillVariants({ outcome: 'done' }),
                      'opacity-0 [transition:scale_500ms_var(--ease-out),background-color_300ms_ease-out,opacity_800ms_var(--ease-soft)_900ms]',
                    )
                  : progressFillVariants({ outcome: 'none' })
              "
              :style="{ scale: `${f.status === 'done' ? 1 : (f.progress ?? 0)} 1` }"
            />
            <!-- The file as its kind, or its own thumbnail; done or failed, a small mark on its corner. -->
            <span class="relative">
              <FileIcon :name="f.name" :file="f.file" />
              <Transition
                enter-active-class="transition-[scale,opacity,filter] duration-[250ms] ease-in-out motion-reduce:transition-none"
                enter-from-class="scale-25 opacity-0 blur-[2px]"
              >
                <span
                  v-if="f.status === 'error' || (f.status === 'done' && upload)"
                  :key="f.status"
                  :class="[
                    'absolute -right-1.5 -bottom-1 flex size-4 items-center justify-center rounded-full ring-2 ring-[color:var(--color-bg)]',
                    f.status === 'error' ? 'bg-[color:var(--color-danger)]' : 'bg-[color:var(--color-success)]',
                    'text-[color:var(--color-bg)]',
                  ]"
                >
                  <component
                    :is="f.status === 'error' ? AlertMarkIcon : CheckIcon"
                    aria-hidden="true"
                    class="size-2.5"
                    stroke-width="3.5"
                  />
                </span>
              </Transition>
            </span>
            <span class="relative min-w-0 flex-1 truncate">{{ f.name }}</span>
            <span
              :class="[
                'relative shrink-0 text-meta tabular-nums',
                f.status === 'error' ? 'text-[color:var(--color-danger)]' : 'text-fg-muted',
              ]"
            >
              <template v-if="f.status === 'uploading'">{{ Math.round((f.progress ?? 0) * 100) }}%</template>
              <template v-else>{{ f.status === 'error' ? f.error : size(f.size) }}</template>
            </span>
            <button
              type="button"
              :aria-label="`${removeLabel} ${f.name}`"
              class="relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-fg-faint transition-colors hover:text-fg focus-ring"
              @click="remove(f.id)"
            >
              <XIcon aria-hidden="true" class="size-3.5" />
            </button>
          </div>
        </div>
      </li>
    </TransitionGroup>
  </div>
</template>
