/** The circle, as Checkbox's box: a hairline at rest, filled once chosen, a hole at its centre, lined up with the label's first line. */
export const radioCircleClass = [
  'group/radio relative mt-0.5 flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full',
  'border border-[color:var(--checkbox-border,var(--color-border-strong))]',
  'transition-[border-color] duration-150 ease-out',
  'data-[state=checked]:border-transparent',
  'focus-ring disabled:cursor-not-allowed',
]

/**
 * The fill: the whole circle in the accent, with a small hole of the page's colour at its centre
 * (as Radix Themes, shadcn/ui and Base UI draw it: full alone reads as a status dot, not a choice).
 * It grows out of its centre as it is chosen and shrinks back as another is.
 */
export const radioDotClass = [
  'absolute -inset-px flex items-center justify-center rounded-full bg-[color:var(--checkbox-bg,var(--color-accent))]',
  "after:size-1.5 after:rounded-full after:bg-[color:var(--checkbox-fg,var(--color-bg))] after:content-['']",
  'scale-0 transition-transform duration-200 ease-emphasized group-data-[state=checked]/radio:scale-100',
  'motion-reduce:transition-none',
]
