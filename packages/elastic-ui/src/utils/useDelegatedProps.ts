import { computed } from 'vue'

/**
 * A part's props without `class`, which the part merges itself, and without any of its own props
 * (`omit`), to pass the rest on to Reka UI. Anything left over would land on the element as an
 * attribute.
 */
export function useDelegatedProps<T extends { class?: unknown }, K extends keyof T = never>(
  props: T,
  ...omit: K[]
) {
  return computed(() => {
    const rest: Partial<T> = { ...props }
    delete rest.class
    for (const key of omit) delete rest[key]
    return rest as Omit<T, 'class' | K>
  })
}
