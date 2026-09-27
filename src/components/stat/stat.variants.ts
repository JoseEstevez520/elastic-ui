import { cva, type VariantProps } from 'class-variance-authority'

/** The figure itself: `md` leads a card or a page of figures, `sm` sits several to a row. */
export const statValueVariants = /* @__PURE__ */ cva('text-fg tabular-nums', {
  variants: {
    size: {
      sm: 'text-title',
      md: 'text-display',
    },
  },
  defaultVariants: { size: 'md' },
})

export type StatVariants = VariantProps<typeof statValueVariants>
export type StatSize = NonNullable<StatVariants['size']>
export type StatTrendTone = 'positive' | 'negative' | 'neutral'

/** The trend's colour, as a CSS value; `neutral` gets none, so it falls back to `text-fg-muted`. */
export function trendColorVar(tone: StatTrendTone): string | undefined {
  if (tone === 'positive') return 'var(--color-success)'
  if (tone === 'negative') return 'var(--color-danger)'
  return undefined
}
