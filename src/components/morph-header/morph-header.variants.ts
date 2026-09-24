import { cva } from 'class-variance-authority'

// Lines up with a centered content column by default: 86% of the viewport, 60% from `sm`.
export const morphHeaderWidth = 'w-[var(--morph-header-width,86%)] sm:w-[var(--morph-header-width,60%)]'
const width = morphHeaderWidth
const glass = [
  'backdrop-blur-xl backdrop-saturate-150',
  'bg-[color:var(--morph-header-bg,color-mix(in_srgb,var(--color-bg)_72%,transparent))]',
]

/** The surface's three shapes: a wide bar at the top, a pill once scrolled, a panel when open. */
export const morphHeaderSurfaceVariants = /* @__PURE__ */ cva(
  'pointer-events-auto relative flex flex-col text-fg transition-colors duration-300 ease-glide',
  {
    variants: {
      shape: {
        bar: ['mt-6', width],
        pill: 'mt-3 px-4 py-2 sm:px-5',
        panel: ['mt-3 p-2 sm:max-w-md', width, glass],
      },
    },
  },
)

export const morphHeaderGlassClass = ['pointer-events-none absolute inset-0 origin-center', glass]

export const morphHeaderLinkVariants = /* @__PURE__ */ cva(
  'text-base text-[color:var(--morph-header-link,var(--color-fg))] transition-colors duration-300 ease-glide',
  {
    variants: {
      placement: {
        inline: 'whitespace-nowrap',
        panel: 'rounded-xl px-3 py-3 leading-snug hover:bg-bg-inset',
      },
    },
  },
)
