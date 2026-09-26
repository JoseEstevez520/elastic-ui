import { cva, type VariantProps } from 'class-variance-authority'

/**
 * The surface every field shares (Input, Textarea): a tray a tone off the page with no line at
 * rest, so a form reads as places to write rather than boxes (tried in Lab/Fields). A soft line
 * comes on hover; on focus the tray lifts to the raised tone, with no dark line, colour or halo;
 * invalid, the line takes the danger colour. Colors read `--input-*` first; a Card, already on the surface tone, sets its fields a tone deeper.
 */
export const fieldClass = [
  'peer w-full min-w-0 text-ui text-fg placeholder:text-fg-faint outline-none',
  'rounded-[var(--input-radius,var(--radius-md))] bg-[color:var(--input-bg,var(--color-surface))]',
  'border border-[color:var(--input-border,transparent)]',
  'transition-colors duration-150 ease-out',
  'hover:border-[color:var(--input-border-hover,var(--color-border-strong))]',
  'focus:border-[color:var(--input-border-focus,var(--color-border-strong))] focus:bg-[color:var(--input-bg-focus,var(--color-surface-raised))]',
  'aria-invalid:border-[color:var(--color-danger)]',
  'disabled:cursor-not-allowed disabled:opacity-50',
]

/** A field with no line: the text alone, inside a surface that frames it. */
export const fieldBareClass = [
  'w-full min-w-0 bg-transparent text-ui text-fg placeholder:text-fg-faint outline-none',
  'disabled:cursor-not-allowed disabled:opacity-50',
]

export const inputVariants = /* @__PURE__ */ cva(fieldClass, {
  variants: {
    size: {
      sm: 'h-8 px-2.5',
      md: 'h-10 px-3',
    },
    /** Room for the icon on the left. */
    withIcon: { true: '', false: '' },
  },
  compoundVariants: [
    { size: 'sm', withIcon: true, class: 'pl-8' },
    { size: 'md', withIcon: true, class: 'pl-9' },
  ],
  defaultVariants: { size: 'md', withIcon: false },
})

/** Darkens along with the line when the field takes focus. */
export const inputIconVariants = /* @__PURE__ */ cva(
  'pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-fg-faint transition-colors duration-150 peer-focus:text-fg-secondary',
  {
    variants: { size: { sm: 'left-2.5', md: 'left-3' } },
    defaultVariants: { size: 'md' },
  },
)

export type InputVariants = VariantProps<typeof inputVariants>
