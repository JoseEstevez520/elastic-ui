import { cva, type VariantProps } from 'class-variance-authority'

/**
 * A button that stays pressed, for toolbars (bold, a view mode, play). Pressed by tone, not
 * colour: at rest it has no surface, only its muted icon; hovered it takes the page's surface tone;
 * pressed it stands on the raised tone, its icon in the text's colour.
 */
export const toggleVariants = /* @__PURE__ */ cva(
  [
    'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--toggle-radius,var(--radius-md))] text-label',
    'text-fg-muted transition-[background-color,color] duration-150 ease-out hover:text-fg',
    'focus-ring disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 min-w-8 px-2',
        md: 'h-9 min-w-9 px-2.5',
      },
      // Alone, it draws its own surfaces. In a group, the group's tray is its surface; a pressed item
      // in `single` gets the indicator that slides between them, one in `multiple` its own raised part.
      in: {
        alone: 'hover:bg-surface data-[state=on]:bg-surface-raised data-[state=on]:text-fg',
        single: 'relative data-[state=on]:text-fg',
        multiple: 'data-[state=on]:bg-surface-raised data-[state=on]:text-fg',
      },
    },
    defaultVariants: { size: 'md', in: 'alone' },
  },
)
export type ToggleSize = NonNullable<VariantProps<typeof toggleVariants>['size']>

/** The group: a tray a tone off the page, its items the parts set on it. */
export const toggleGroupClass =
  'relative isolate inline-flex items-center gap-0.5 rounded-[var(--toggle-group-radius,var(--radius-lg))] bg-[color:var(--toggle-group-bg,var(--color-surface))] p-0.5'

/**
 * The raised part under the pressed item of a `single` group: one element that slides to the next
 * item on the library's ease, as the Tabs' indicator does, so the choice is seen moving.
 */
export const toggleIndicatorClass = [
  'pointer-events-none absolute top-0.5 bottom-0.5 left-0 -z-10 rounded-[var(--toggle-radius,var(--radius-md))] bg-surface-raised',
  'motion-reduce:transition-none',
]
