/** The track: the slides in a row, moved as one to the one chosen, on the library's morph ease. */
export const carouselTrackClass = 'flex touch-pan-y gap-[var(--carousel-gap,1rem)] will-change-transform select-none'

/**
 * A slide: as wide as the carousel by default, or a share of it when several are in view
 * (`--carousel-per-view`, gaps included); a `basis-*` class lets the next one peek in instead.
 */
export const carouselItemClass =
  'min-w-0 shrink-0 grow-0 basis-[calc((100%-(var(--carousel-per-view,1)-1)*var(--carousel-gap,1rem))/var(--carousel-per-view,1))]'

/** The dots: small, quiet marks in the faint tone; the one shown is a pill of the text's colour. */
export const DOT = 6
export const DOT_GAP = 10
export const PILL = 16
