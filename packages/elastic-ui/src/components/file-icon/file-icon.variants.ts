/** What a file is, read from its extension, which gives its icon its colour. */
export type FileKind =
  'pdf' | 'document' | 'sheet' | 'slides' | 'archive' | 'code' | 'image' | 'video' | 'audio' | 'other'

const KINDS: Record<Exclude<FileKind, 'other'>, string[]> = {
  pdf: ['pdf'],
  document: ['doc', 'docx', 'odt', 'rtf', 'txt', 'md', 'pages'],
  sheet: ['xls', 'xlsx', 'ods', 'csv', 'numbers'],
  slides: ['ppt', 'pptx', 'odp', 'key'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz', 'tgz'],
  code: [
    'js',
    'ts',
    'vue',
    'html',
    'css',
    'json',
    'java',
    'py',
    'php',
    'sql',
    'sh',
    'xml',
    'yml',
    'yaml',
    'c',
    'cpp',
    'cs',
  ],
  image: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg', 'heic'],
  video: ['mp4', 'mov', 'webm', 'mkv', 'avi'],
  audio: ['mp3', 'wav', 'ogg', 'm4a', 'flac'],
}

export const extensionOf = (name: string) => (name.includes('.') ? name.split('.').pop()!.toLowerCase() : '')

export const kindOf = (extension: string): FileKind =>
  (Object.keys(KINDS) as (keyof typeof KINDS)[]).find((kind) => KINDS[kind].includes(extension)) ?? 'other'

/** Each kind's colour, soft enough to tint a page; `--file-icon-color` overrides it. */
export const kindColor: Record<FileKind, string> = {
  pdf: 'var(--color-danger)',
  document: 'var(--color-accent)',
  sheet: 'var(--color-success)',
  slides: 'var(--color-warning)',
  archive: 'var(--color-fg-muted)',
  code: 'light-dark(#7c3aed, #a78bfa)',
  image: 'light-dark(#db2777, #f472b6)',
  video: 'light-dark(#7c3aed, #a78bfa)',
  audio: 'light-dark(#0891b2, #22d3ee)',
  other: 'var(--color-fg-muted)',
}

/** Sizes, as a page is taller than wide: xs inside a row's icon box, sm beside a line of text, md for a row or a list, lg for a card. */
export const fileIconSize = { xs: 'h-[17px] w-[14px]', sm: 'h-8 w-[26px]', md: 'h-10 w-8', lg: 'h-16 w-[52px]' } as const
