import { computed, inject, provide, type ComputedRef, type InjectionKey } from 'vue'

/** What a Field tells the control inside it, so the label, the help and the error reach it. */
export interface FieldContext {
  /** The control's id, which the label points at. */
  id: string
  /** The label's own id, for a group of controls, which a label cannot point at. */
  labelId: string
  /** The ids of the help and the error on show, for `aria-describedby`. */
  describedBy: ComputedRef<string | undefined>
  /** There is an error to fix. */
  invalid: ComputedRef<boolean>
}

const FieldKey: InjectionKey<FieldContext> = Symbol('Field')

export const provideField = (context: FieldContext) => provide(FieldKey, context)

/**
 * The attributes a control takes from the Field around it, if any: its id, what describes it, and
 * whether it is invalid (`invalid` given to the control itself wins).
 */
export function useFieldControl(own: () => boolean | undefined) {
  const field = inject(FieldKey, null)
  return computed(() => ({
    id: field?.id,
    'aria-describedby': field?.describedBy.value,
    'aria-invalid': own() || field?.invalid.value || undefined,
  }))
}

/**
 * For a group of controls in a Field (a RadioGroup): a label cannot point at a group, so the group
 * names itself after the label, and takes what describes it and whether it is invalid.
 */
export function useFieldGroup() {
  const field = inject(FieldKey, null)
  return computed(() => ({
    'aria-labelledby': field?.labelId,
    'aria-describedby': field?.describedBy.value,
    'aria-invalid': field?.invalid.value || undefined,
  }))
}
