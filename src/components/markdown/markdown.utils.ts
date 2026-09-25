import MarkdownIt from 'markdown-it'

/** One markdown-it for everything: HTML in the source is passed through, links are made. */
export const markdown = new MarkdownIt({ html: true, linkify: true })

export type Token = ReturnType<MarkdownIt['parse']>[number]

/**
 * A heading's id, as GitHub makes them: lower case, spaces as hyphens, punctuation dropped,
 * letters of any language kept.
 */
export function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
}

/** The plain text of an inline token, for a heading's id and its entry in a table of contents. */
export const textOf = (inline: Token | undefined) =>
  (inline?.children ?? []).map((child) => (child.type === 'code_inline' || child.type === 'text' ? child.content : '')).join('')

/** A fence's info string: its language, then `key=value` or `key="value with spaces"` pairs. */
export function parseInfo(info: string) {
  const [language = '', ...rest] = info.trim().split(/\s+/)
  const attrs: Record<string, string> = {}
  for (const match of rest.join(' ').matchAll(/(\w[\w-]*)=(?:"([^"]*)"|(\S+))/g)) attrs[match[1]!] = match[2] ?? match[3] ?? ''
  return { language, attrs }
}

/** A unified diff back into the code before and after it: `-` lines are only before, `+` only after. */
export function splitDiff(diff: string) {
  const before: string[] = []
  const after: string[] = []
  for (const line of diff.replace(/\n$/, '').split('\n')) {
    const mark = line[0]
    const text = line.slice(1)
    if (mark === '-') before.push(text)
    else if (mark === '+') after.push(text)
    else {
      before.push(mark === ' ' ? text : line)
      after.push(mark === ' ' ? text : line)
    }
  }
  return { before: before.join('\n'), after: after.join('\n') }
}

/** The page's headings, levels 2 and 3, as TableOfContents takes them, with the ids Markdown gives them. */
export function headingsOf(source: string) {
  const tokens = markdown.parse(source, {})
  const seen = new Map<string, number>()
  return tokens.flatMap((token, i) => {
    if (token.type !== 'heading_open' || (token.tag !== 'h2' && token.tag !== 'h3')) return []
    const label = textOf(tokens[i + 1])
    return [{ id: uniqueSlug(slugify(label), seen), label, level: (token.tag === 'h2' ? 2 : 3) as 2 | 3 }]
  })
}

/** A slug made unique on its page by a number, as GitHub does for repeated headings. */
export function uniqueSlug(slug: string, seen: Map<string, number>) {
  const count = seen.get(slug) ?? 0
  seen.set(slug, count + 1)
  return count ? `${slug}-${count}` : slug
}

/**
 * A terminal session written as it looks: `$ ` starts a command, `# ` a comment before the next
 * one, and any other line is what the last command printed.
 */
export function parseTerminal(code: string) {
  const entries: { comment?: string; command: string; output?: string }[] = []
  let comment: string | undefined
  for (const line of code.replace(/\n$/, '').split('\n')) {
    if (line.startsWith('$ ')) {
      entries.push({ comment, command: line.slice(2) })
      comment = undefined
    } else if (line.startsWith('# ')) {
      comment = line.slice(2)
    } else if (entries.length) {
      const last = entries.at(-1)!
      last.output = last.output === undefined ? line : `${last.output}\n${line}`
    }
  }
  // Blank lines left between a command's output and the next comment are not output.
  for (const entry of entries) entry.output = entry.output?.replace(/\n+$/, '') || undefined
  return entries
}
