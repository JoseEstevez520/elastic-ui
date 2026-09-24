import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Colors read `--button-*` first, so a project can restyle every button without touching
 * variants; each falls back to the global token.
 */
export const buttonVariants = /* @__PURE__ */ cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium select-none',
    'rounded-[var(--button-radius,var(--radius-md))]',
    'transition-[background-color,color,border-color,scale] duration-150 ease-out active:scale-[0.97]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    'disabled:pointer-events-none disabled:opacity-50',
    'aria-disabled:pointer-events-none aria-disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        solid: [
          'bg-[color:var(--button-bg,var(--color-accent))]',
          'text-[color:var(--button-fg,var(--color-accent-fg))]',
          'hover:bg-[color:var(--button-bg-hover,var(--color-accent-hover))]',
        ],
        outline: [
          'border border-[color:var(--button-border,var(--color-border-strong))]',
          'bg-transparent text-fg hover:bg-bg-muted',
        ],
        ghost: 'bg-transparent text-fg-secondary hover:bg-bg-muted hover:text-fg',
        link: 'h-auto px-0 text-accent underline-offset-4 hover:underline active:scale-100',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'md',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
