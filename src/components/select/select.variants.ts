/** The field's row: what is chosen and the chevron; its outline is the FieldMorph around it. */
export const selectTriggerClass = [
  'group/trigger flex h-10 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-[var(--input-radius,var(--radius-md))] px-3 text-left text-ui text-fg',
  'focus-ring-inset disabled:pointer-events-none disabled:opacity-50',
]

/** Room on the left for the check, so options line up whether chosen or not. */
export const selectItemClass = [
  'relative flex cursor-pointer items-center rounded-[var(--radius-sm)] py-2 pr-3 pl-8 outline-none select-none',
  'data-[highlighted]:bg-bg-muted',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
]
