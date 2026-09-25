import { computed, inject, provide, shallowReactive, type ComputedRef, type InjectionKey, type Ref } from 'vue'

export interface CommandPaletteContext {
  query: Ref<string>
  /** Whether the palette has finished arriving: until then its list clips instead of scrolling. */
  settled: Readonly<Ref<boolean>>
  /** How many items match the query, in the whole palette or in one group. */
  matching: (group?: string) => number
  /** Adds an item to the count; returns what takes it out again. */
  register: (id: string, group: string | undefined, matches: ComputedRef<boolean>) => () => void
  close: () => void
}

const CommandPaletteContextKey: InjectionKey<CommandPaletteContext> = Symbol('CommandPaletteContext')
const CommandGroupKey: InjectionKey<string> = Symbol('CommandGroup')

/** The registry behind `matching` and `register`: items count themselves in as they mount. */
export function useCommandRegistry() {
  // Shallow, so the matches stay refs instead of being unwrapped.
  const items = shallowReactive(new Map<string, { group?: string; matches: ComputedRef<boolean> }>())
  const counts = computed(() => {
    const byGroup = new Map<string | undefined, number>()
    for (const { group, matches } of items.values()) {
      if (!matches.value) continue
      byGroup.set(undefined, (byGroup.get(undefined) ?? 0) + 1)
      if (group) byGroup.set(group, (byGroup.get(group) ?? 0) + 1)
    }
    return byGroup
  })
  return {
    matching: (group?: string) => counts.value.get(group) ?? 0,
    register(id: string, group: string | undefined, matches: ComputedRef<boolean>) {
      items.set(id, { group, matches })
      return () => items.delete(id)
    },
  }
}

export function provideCommandPaletteContext(context: CommandPaletteContext) {
  provide(CommandPaletteContextKey, context)
}

export function useCommandPaletteContext(): CommandPaletteContext {
  const context = inject(CommandPaletteContextKey, null)
  if (!context) throw new Error('CommandPalette parts must be used inside <CommandPalette>.')
  return context
}

export const provideCommandGroup = (id: string) => provide(CommandGroupKey, id)
export const useCommandGroup = () => inject(CommandGroupKey, undefined)
