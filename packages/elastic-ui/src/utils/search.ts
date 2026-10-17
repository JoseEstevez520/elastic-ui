/** Lower case and without accents, so `cafe` finds "Café". */
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/** Every word of the query appears somewhere in the text or its keywords, in any order. */
export function matchesQuery(query: string, text: string, keywords: readonly string[] = []) {
  const haystack = normalize([text, ...keywords].join(' '))
  return normalize(query)
    .split(/\s+/)
    .every((word) => haystack.includes(word))
}
