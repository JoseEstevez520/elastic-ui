import { onBeforeUnmount, onMounted } from 'vue'

type Target = Window | Document | HTMLElement | MediaQueryList

/**
 * Adds a listener on mount and removes it on unmount. The target is a getter so it is only
 * resolved in the browser, after mount.
 */
export function useEventListener<E extends Event>(
  target: () => Target,
  event: string,
  handler: (event: E) => void,
  options?: AddEventListenerOptions,
) {
  const listener = handler as EventListener
  let resolved: Target | undefined

  onMounted(() => {
    resolved = target()
    resolved.addEventListener(event, listener, options)
  })
  onBeforeUnmount(() => resolved?.removeEventListener(event, listener, options))
}
