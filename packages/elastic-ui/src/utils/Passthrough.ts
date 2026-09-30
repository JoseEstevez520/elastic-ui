import type { FunctionalComponent } from 'vue'

/** Renders its default slot and nothing else: for a wrapper that is only sometimes needed. */
export const Passthrough: FunctionalComponent = (_, { slots }) => slots.default?.()
