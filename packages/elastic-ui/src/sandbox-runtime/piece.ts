/** The name a piece imports the library's parts from, as in a project. */
export const LIBRARY = '@joseestevez/vue-elastic-ui'

export interface PieceParts {
  template: string
  script?: string
  style?: string
}

/**
 * A piece as a Vue single-file component: a `<template>`, a plain `<script>` and an optional
 * `<style>`. The template runs to the last `</template>`, so it may hold `<template #slot>`s of
 * its own. Without a `<template>` the whole piece is the template.
 */
export function splitPiece(source: string): PieceParts {
  const open = /<template(\s[^>]*)?>/i.exec(source)
  const close = source.toLowerCase().lastIndexOf('</template>')
  if (!open || close < open.index) return { template: source }
  const template = source.slice(open.index + open[0].length, close)
  const rest = source.slice(0, open.index) + source.slice(close + '</template>'.length)
  const script = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/i.exec(rest)
  if (script && /\bsetup\b/.test(script[1] ?? ''))
    throw new Error('<script setup> needs a compiler the frame does not have: write <script> with export default { setup() { … return { … } } }.')
  const style = /<style(\s[^>]*)?>([\s\S]*?)<\/style>/i.exec(rest)
  return { template, script: script?.[2], style: style?.[2] }
}

/**
 * The script as the body of a function: named imports from `vue` and from the library become
 * reads of what the runtime hands it, and `export default` its return. Nothing else may be
 * imported: there is no network to bring it from.
 */
export function scriptBody(script: string): string {
  return script
    .replace(/^\s*import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]\s*;?/gm, (_, names: string, from: string) => {
      const source = from === 'vue' ? 'Vue' : from === LIBRARY ? 'Parts' : undefined
      if (!source) throw new Error(`Only vue and ${LIBRARY} can be imported, not "${from}".`)
      return `const {${names.replace(/\s+as\s+/g, ': ')}} = ${source};`
    })
    .replace(/^\s*import\s.*$/gm, (line) => {
      throw new Error(`Only named imports work here: ${line.trim()}`)
    })
    .replace(/\bexport\s+default\b/, 'return ')
}
