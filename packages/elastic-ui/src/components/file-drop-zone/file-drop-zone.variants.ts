/**
 * The layer over a region while files are held over it: the ground, a little see-through, so the
 * page is still there behind, and its words. It never takes the pointer, so entering and leaving
 * the region's children stay the region's own.
 */
export const fileDropZoneLayerClass = [
  'pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-[inherit]',
  'bg-[color:color-mix(in_oklab,var(--color-bg)_82%,transparent)] backdrop-blur-[2px]',
  'text-ui font-medium text-fg-secondary',
]
