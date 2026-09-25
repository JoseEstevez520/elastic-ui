/**
 * A small box that fills with the accent once checked. Lined up with the label's first line (a
 * 20px line, so 2px down), however many lines the label takes.
 */
export const checkboxBoxClass = [
  'group/box mt-0.5 flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px]',
  'border border-[color:var(--checkbox-border,var(--color-border-strong))] text-[color:var(--color-accent-fg)]',
  'transition-[background-color,border-color] duration-150 ease-out',
  'data-[state=checked]:border-[color:var(--checkbox-bg,var(--color-accent))] data-[state=checked]:bg-[color:var(--checkbox-bg,var(--color-accent))]',
  'data-[state=indeterminate]:border-[color:var(--checkbox-bg,var(--color-accent))] data-[state=indeterminate]:bg-[color:var(--checkbox-bg,var(--color-accent))]',
  'focus-ring',
  'disabled:cursor-not-allowed',
]

/**
 * The marks are drawn along their stroke as they appear, and undrawn as they go. The dash is longer
 * than the path, so the whole stroke hides behind its own gap. From checked to in between, the
 * check is undrawn while the dash is drawn, and back: one mark turns into the other.
 */
const mark = [
  '[stroke-dasharray:16] [stroke-dashoffset:16] transition-[stroke-dashoffset] duration-200 ease-out',
  'motion-reduce:transition-none',
]
export const checkboxCheckClass = [
  mark,
  // Drawn once the fill has started, so the mark lands on colour rather than on the empty box.
  'group-data-[state=checked]/box:[stroke-dashoffset:0] group-data-[state=checked]/box:delay-75',
]
export const checkboxDashClass = [
  mark,
  'group-data-[state=indeterminate]/box:[stroke-dashoffset:0] group-data-[state=indeterminate]/box:delay-75',
]
