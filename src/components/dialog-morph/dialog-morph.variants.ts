/** Looks like an outline Button, since at rest it is one. */
export const dialogMorphTriggerClass = [
  'relative inline-flex h-10 cursor-pointer items-center justify-center px-4 text-label whitespace-nowrap text-fg',
  'bg-[color:var(--dialog-bg,var(--color-bg))]',
  'focus-ring',
]

/**
 * The box clips instead of scrolling: while it grows the content does not fit yet, and a
 * scrolling box would flash scrollbars on every side. Only the content scrolls, when it is
 * really taller than the screen.
 */
export const dialogMorphSurfaceClass = [
  'pointer-events-auto relative flex max-h-[85dvh] w-[min(var(--dialog-width,28rem),100%)] flex-col overflow-hidden',
  'bg-[color:var(--dialog-bg,var(--color-bg))] text-fg outline-none',
]

/** Dims the page while the dialog is out; fades with the box's morph both ways. */
export const dialogMorphOverlayClass = [
  'fixed inset-0 z-50 bg-[color:var(--dialog-overlay,rgb(0_0_0/0.4))]',
  'data-[state=open]:animate-[fade-in_0.3s_linear] data-[state=closed]:animate-[fade-out_0.3s_linear_forwards]',
  'motion-reduce:animate-none',
]

/** The label left behind in the button's place fades out there as the box leaves. */
export const dialogMorphLabelOutClass = 'animate-[fade-out_0.15s_linear_forwards] motion-reduce:invisible'

/**
 * Radius and edge of a box that morphs from its button (DialogMorph, CommandPalette), set inline on
 * the elements sharing the `layoutId`, where Motion corrects them against its scale and animates
 * between them. A CSS border would stretch mid-morph.
 */
export const morphTriggerPaint = { borderRadius: '8px', boxShadow: '0 0 0 1px var(--color-border-strong)' }
export const morphSurfacePaint = { borderRadius: '16px', boxShadow: '0 0 0 1px var(--color-border), var(--shadow-overlay)' }
