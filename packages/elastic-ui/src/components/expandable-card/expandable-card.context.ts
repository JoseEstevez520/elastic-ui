import { inject, provide, type InjectionKey, type Ref } from 'vue'

export interface ExpandableCardGroupContext {
  /** The card whose body is showing. Cleared first when closing, which starts the body's fade. */
  openId: Readonly<Ref<string | null>>
  /** The card lifted out of its cell. Cleared once its body has faded out. */
  liftedId: Readonly<Ref<string | null>>
  /** The card mid-cycle. Cleared once the return morph lands, so siblings reappear only then. */
  activeId: Readonly<Ref<string | null>>
  open: (id: string) => void
  close: () => void
  onBodyHidden: (id: string) => void
  onReturned: (id: string) => void
}

/**
 * Which copy of a card's head is rendering. The same slot renders in the grid cell, in the
 * lifted overlay, and in an invisible placeholder that holds the cell's height while the card
 * is lifted. Only the first two morph; the placeholder must not claim any `layoutId`.
 */
export interface ExpandableCardRegionContext {
  id: string
  placement: 'cell' | 'overlay' | 'placeholder'
  expanded: boolean
  /** Rendered width of each `ExpandableCardText` in the cell, keyed by name, for the reveal. */
  textWidths: Map<string, number>
}

const GroupKey: InjectionKey<ExpandableCardGroupContext> = Symbol('ExpandableCardGroup')
const RegionKey: InjectionKey<ExpandableCardRegionContext> = Symbol('ExpandableCardRegion')

export function provideExpandableCardGroup(context: ExpandableCardGroupContext) {
  provide(GroupKey, context)
}

export function useExpandableCardGroup(): ExpandableCardGroupContext {
  const context = inject(GroupKey, null)
  if (!context) throw new Error('<ExpandableCard> must be used inside <ExpandableCardGroup>.')
  return context
}

export function provideExpandableCardRegion(context: ExpandableCardRegionContext) {
  provide(RegionKey, context)
}

export function useExpandableCardRegion(): ExpandableCardRegionContext {
  const context = inject(RegionKey, null)
  if (!context) throw new Error('ExpandableCard parts must be used inside <ExpandableCard>.')
  return context
}
