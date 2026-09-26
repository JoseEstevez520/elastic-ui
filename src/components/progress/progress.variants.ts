import { cva, type VariantProps } from 'class-variance-authority'

/** The track: a groove set into what holds it, a tone deeper, with no line (depth from tones); the
 * Switch's track tone, which still reads on the dark page where the sunk surface would not. */
export const progressTrackClass =
  'relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[color:var(--progress-track,var(--color-bg-inset))]'

/**
 * The fill grows by scaling a layer from the start edge, never by resizing anything, and glides
 * towards each new amount for longer than updates usually take to arrive, so steady steps run
 * together into one movement (as ProgressButton's fill). In the text's colour, or the accent.
 */
export const progressFillVariants = /* @__PURE__ */ cva(
  'absolute inset-0 origin-left rounded-full transition-[scale] duration-500 ease-out motion-reduce:transition-none',
  {
    variants: {
      tone: {
        default: 'bg-[color:var(--progress-fill,var(--color-fg))]',
        accent: 'bg-[color:var(--progress-fill,var(--color-accent))]',
      },
    },
    defaultVariants: { tone: 'default' },
  },
)
export type ProgressTone = NonNullable<VariantProps<typeof progressFillVariants>['tone']>

/**
 * Once complete, room opens at the track's end and a check is drawn there, in the success colour:
 * the track steps aside (leaving comes before making room), then the mark is drawn along its
 * stroke, as Checkbox's is.
 */
export const progressEndVariants = /* @__PURE__ */ cva(
  'flex shrink-0 items-center justify-end overflow-hidden transition-[width] duration-300 ease-emphasized motion-reduce:transition-none',
  { variants: { shown: { true: 'w-6 delay-300', false: 'w-0' } } },
)
export const progressCheckVariants = /* @__PURE__ */ cva(
  [
    'text-[color:var(--color-success)]',
    '[stroke-dasharray:16] transition-[stroke-dashoffset] ease-out motion-reduce:transition-none',
  ],
  {
    variants: {
      shown: {
        true: '[stroke-dashoffset:0] delay-[550ms] duration-300',
        false: '[stroke-dashoffset:16] duration-150',
      },
    },
  },
)
