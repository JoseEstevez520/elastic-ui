import { cva } from 'class-variance-authority'

/**
 * The progress fills the button from the start edge, behind its label, as a tint of the text
 * colour, so it reads on any variant. It grows by scaling a layer, never by resizing anything,
 * following the amount on a spring (ProgressButton), so steady steps run together into one fill. When the work ends, the fill does not go: it
 * turns into the outcome, taking its colour where it stands.
 */
export const progressFillVariants = /* @__PURE__ */ cva(
  [
    'pointer-events-none absolute inset-0 origin-left',
    'transition-[background-color,opacity] duration-500 ease-out motion-reduce:transition-none',
  ],
  {
    variants: {
      outcome: {
        none: 'bg-current opacity-[0.12]',
        done: 'bg-[color:var(--color-success)] opacity-[0.14]',
        error: 'bg-[color:var(--color-danger)] opacity-[0.14]',
      },
    },
  },
)

/** The label and icon take the outcome's colour along with the fill. */
export const progressOutcomeText = {
  done: 'text-[color:var(--color-success)]',
  error: 'text-[color:var(--color-danger)]',
} as const

/**
 * The amount beside the label. Its own padding stands in for the button's gap (cancelled by the
 * negative margin), so the space before it folds away with it.
 */
export const amountVariants = /* @__PURE__ */ cva(
  [
    'relative -ml-2 overflow-hidden text-left whitespace-nowrap tabular-nums',
    'transition-[width,padding,opacity] duration-300 ease-emphasized motion-reduce:transition-none',
  ],
  {
    variants: {
      shown: {
        true: 'w-[calc(4ch+0.5rem)] pl-2',
        false: 'w-0 pl-0 opacity-0',
      },
    },
  },
)
