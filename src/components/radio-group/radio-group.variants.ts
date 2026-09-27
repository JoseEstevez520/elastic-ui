/** The circle, as Checkbox's box: a hairline at rest, filled whole once chosen, lined up with the label's first line. */
export const radioCircleClass = [
  'group/radio relative mt-0.5 flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full',
  'border border-[color:var(--checkbox-border,var(--color-border-strong))]',
  'transition-[border-color] duration-150 ease-out',
  'data-[state=checked]:border-transparent',
  'focus-ring disabled:cursor-not-allowed',
]

/**
 * The fill: the whole circle, growing out of its centre as it is chosen until it fills it, and
 * shrinking back as another is. No dot inside a ring: a chosen circle is simply full.
 */
export const radioDotClass = [
  'absolute -inset-px rounded-full bg-[color:var(--checkbox-bg,var(--color-accent))]',
  'scale-0 transition-transform duration-200 ease-emphasized group-data-[state=checked]/radio:scale-100',
  'motion-reduce:transition-none',
]
