/** The circle, as Checkbox's box: a hairline at rest, the accent once chosen, lined up with the label's first line. */
export const radioCircleClass = [
  'group/radio mt-0.5 flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full',
  'border border-[color:var(--checkbox-border,var(--color-border-strong))]',
  'transition-[border-color] duration-150 ease-out',
  'data-[state=checked]:border-[color:var(--checkbox-bg,var(--color-accent))]',
  'focus-ring disabled:cursor-not-allowed',
]

/** The dot, growing out of the centre as it is chosen and shrinking back as another is. */
export const radioDotClass = [
  'size-2 rounded-full bg-[color:var(--checkbox-bg,var(--color-accent))]',
  'scale-0 transition-transform duration-200 ease-emphasized group-data-[state=checked]/radio:scale-100',
  'motion-reduce:transition-none',
]
