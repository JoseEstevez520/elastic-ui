/**
 * The field and its chevron as one control, with Input's surface: a hairline that darkens while
 * the field has the focus, and the danger colour when the value needs fixing.
 */
export const comboboxAnchorClass = [
  'flex w-full items-center',
  'rounded-[var(--input-radius,var(--radius-md))] bg-[color:var(--input-bg,transparent)]',
  'border border-[color:var(--input-border,var(--color-border-strong))] transition-colors duration-150 ease-out',
  'hover:border-[color:var(--input-border-hover,var(--color-fg-faint))]',
  'focus-within:border-[color:var(--input-border-focus,var(--color-fg-muted))]',
  'has-[[aria-invalid=true]]:border-[color:var(--color-danger)]',
  'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50',
]
