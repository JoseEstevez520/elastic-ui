import { ref } from 'vue'

/**
 * The part being read on the long Components page, shared with the sidebar so its connected tab
 * follows the reader from part to part, as the TableOfContents on the right does.
 */
export const readingPart = ref<string>()
