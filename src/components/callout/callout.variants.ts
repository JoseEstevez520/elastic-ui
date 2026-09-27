import { cva } from 'class-variance-authority'

/**
 * Set apart by tone, no border, as GitHub's alerts are by a bar. Colour only where it means
 * something (DECISIONS, "How objects are drawn"): a note, a tip or something important stand on
 * the surface tone with only their icon coloured; a warning and a caution, which do mean danger,
 * take a soft tint of their colour.
 */
export const calloutVariants = /* @__PURE__ */ cva(
  [
    'grid grid-cols-[auto_1fr] gap-x-3 rounded-[var(--callout-radius,var(--radius-lg))] px-4 py-3 text-ui',
  ],
  {
    variants: {
      type: {
        note: '[--callout-color:var(--callout-note,var(--color-fg-muted))] bg-surface',
        tip: '[--callout-color:var(--callout-tip,var(--color-fg-muted))] bg-surface',
        important: '[--callout-color:var(--callout-important,var(--color-accent))] bg-surface',
        warning: [
          '[--callout-color:var(--callout-warning,var(--color-warning))]',
          'bg-[color-mix(in_oklab,var(--callout-color)_var(--callout-tint,7%),transparent)]',
        ],
        caution: [
          '[--callout-color:var(--callout-caution,var(--color-danger))]',
          'bg-[color-mix(in_oklab,var(--callout-color)_var(--callout-tint,7%),transparent)]',
        ],
      },
    },
    defaultVariants: { type: 'note' },
  },
)
