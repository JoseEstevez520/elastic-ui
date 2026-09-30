#!/usr/bin/env node
/*
 * Generates the site's data about the library's parts, so a part added to src/ shows up on the
 * site without editing the site. For each folder in src/components:
 *
 * - The stories file(s): every story with its docs and its source, split at the "Situations"
 *   comment into examples and situations (SITE.md §5).
 * - The component file(s): the API as written in the source — props, events and slots — read with
 *   vue-component-meta, and the doc comment as the part's description.
 *
 * Writes site/generated/parts.json (the registry the nav and the explore page read) and
 * site/generated/<folder>.json (everything a part's page needs). A part whose inputs have not
 * changed since the last run is skipped, so restarts stay fast.
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { createChecker } from 'vue-component-meta'

const root = fileURLToPath(new URL('../..', import.meta.url))
const componentsDir = join(root, 'src/components')
const outDir = join(root, 'site/generated')
mkdirSync(outDir, { recursive: true })

const folders = readdirSync(componentsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

// The checker is created lazily and shared: the first API read builds the type program once.
let checker
function apiOf(componentPath) {
  checker ??= createChecker(join(root, 'tsconfig.app.json'), { printer: { newLine: 1 } })
  const meta = checker.getComponentMeta(componentPath)
  return {
    props: meta.props
      .filter((prop) => !prop.global)
      .map((prop) => ({
        name: prop.name,
        type: prop.type,
        required: prop.required || undefined,
        default: prop.default,
        description: prop.description || undefined,
      })),
    events: meta.events.map((event) => ({ name: event.name, type: event.type, description: event.description || undefined })),
    slots: meta.slots.map((slot) => ({ name: slot.name, type: slot.type, description: slot.description || undefined })),
  }
}

/** PascalCases a folder name: `code-block` -> `CodeBlock`, the main component's file name. */
function pascalCase(folder) {
  return folder
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('')
}

/** Turns a story's export name into its title: `WithIconAndLoading` -> "With icon and loading". */
function sentenceCase(name) {
  const words = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
  return words[0] + words.slice(1).toLowerCase()
}

/** Reads a stories file: its category (the meta title's group) and each story it exports. */
function storiesOf(sourcePath) {
  const text = readFileSync(sourcePath, 'utf8')
  const ast = ts.createSourceFile(sourcePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)

  // The "Situations" comment splits examples from the cases the part handles (DECISIONS.md).
  let situationsAt = Infinity
  const commentRe = /\/\/[^\n]*|\/\*[\s\S]*?\*\//g
  for (let match = commentRe.exec(text); match; match = commentRe.exec(text)) {
    if (/situations/i.test(match[0])) {
      situationsAt = match.index
      break
    }
  }

  // The meta's title names the group the part belongs to, as in Storybook: "Actions/Button".
  let category
  for (const statement of ast.statements) {
    if (!ts.isVariableStatement(statement) || !statement.declarationList.declarations.length) continue
    const declaration = statement.declarationList.declarations[0]
    if (!ts.isIdentifier(declaration.name) || declaration.name.text !== 'meta' || !declaration.initializer) continue
    // The object may be wrapped in `satisfies Meta<…>` or `as …`.
    let initializer = declaration.initializer
    while (ts.isSatisfiesExpression(initializer) || ts.isAsExpression(initializer)) initializer = initializer.expression
    if (!ts.isObjectLiteralExpression(initializer)) continue
    for (const property of initializer.properties) {
      if (ts.isPropertyAssignment(property) && ts.isIdentifier(property.name) && property.name.text === 'title') {
        if (ts.isStringLiteral(property.initializer)) category = property.initializer.text.split('/')[0]
      }
    }
  }

  const stories = []
  for (const statement of ast.statements) {
    if (!ts.isVariableStatement(statement)) continue
    const isExported = statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
    if (!isExported) continue
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name)) continue
      // The story's docs are the JSDoc right above it; its code is the statement, as written.
      const jsDoc = ts.getJSDocCommentsAndTags(ast, statement).find((node) => ts.isJSDoc(node))
      const docs = jsDoc ? String(ts.getJSDocCommentAsPlainText(jsDoc) ?? '').trim() : undefined
      const source = statement
        .getText(ast)
        .replace(/^export\s+/, '')
        .replace(/;?\n?$/, '')
      stories.push({
        key: declaration.name.text,
        name: sentenceCase(declaration.name.text),
        docs: docs || undefined,
        source,
        file: sourcePath.split('/').pop(),
        situation: statement.getStart(ast) > situationsAt || undefined,
      })
    }
  }
  return { category, stories }
}

/**
 * The component's doc comment: the JSDoc right before `defineProps`/`defineModel` (vue-component-meta
 * does not surface it for script setup). None at all when the file documents only its props — a prop's
 * doc is never the part's description. Just its first paragraph (SITE.md §5).
 */
function descriptionOf(sourcePath) {
  const text = readFileSync(sourcePath, 'utf8')
  const script = text.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? ''
  const propsAt = script.search(/defineProps[<(]|defineModel[<(]/)
  const docs = [...script.matchAll(/\/\*\*([\s\S]*?)\*\//g)]
  const before = propsAt >= 0 ? docs.filter((doc) => doc.index < propsAt) : docs
  const doc = propsAt >= 0 ? before.at(-1) : before[0]
  if (!doc) return undefined
  const body = doc[1]
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, ''))
    .join('\n')
    .trim()
  return body.split(/\n\s*\n/)[0]?.replace(/\n/g, ' ') || undefined
}

/** Comment blocks that credit where a part was inspired from carry a link (SITE.md §5). */
function creditsOf(sourcePath) {
  const text = readFileSync(sourcePath, 'utf8')
  // Consecutive `//` lines are one comment; JSDoc blocks stand on their own.
  const blocks = []
  const commentRe = /\/\*\*([\s\S]*?)\*\/|((?:[ \t]*\/\/[^\n]*\n?)+)/g
  for (let match = commentRe.exec(text); match; match = commentRe.exec(text)) {
    const body = match[1] ?? match[2]
    const clean = body
      .split('\n')
      .map((line) => line.replace(/^\s*(?:\*|\/\/)\s?/, '').trim())
      .filter(Boolean)
      .join(' ')
    if (clean && /https?:\/\//.test(clean)) blocks.push(clean)
  }
  return blocks.length ? blocks : undefined
}

const fingerprint = (files) =>
  createHash('sha1')
    .update(files.map((file) => `${file}:${readFileSync(file, 'utf8')}`).join('\n'))
    .digest('hex')

const fingerprintsPath = join(outDir, '.fingerprints.json')
const fingerprints = existsSync(fingerprintsPath) ? JSON.parse(readFileSync(fingerprintsPath, 'utf8')) : {}

const registry = []
for (const folder of folders) {
  const dir = join(componentsDir, folder)
  const vueFiles = readdirSync(dir)
    .filter((file) => file.endsWith('.vue'))
    .sort((a, b) => (a === `${pascalCase(folder)}.vue` ? -1 : b === `${pascalCase(folder)}.vue` ? 1 : a.localeCompare(b)))
  const storiesFiles = readdirSync(dir)
    .filter((file) => file.endsWith('.stories.ts'))
    .sort()
  const inputs = [...vueFiles, ...storiesFiles].map((file) => join(dir, file))
  if (!vueFiles.length || !storiesFiles.length) continue

  const outPath = join(outDir, `${folder}.json`)
  if (fingerprints[folder] === fingerprint(inputs) && existsSync(outPath)) {
    registry.push(JSON.parse(readFileSync(outPath, 'utf8')).registryEntry)
    continue
  }

  let category
  const stories = []
  for (const file of storiesFiles) {
    const parsed = storiesOf(join(dir, file))
    category ??= parsed.category
    stories.push(...parsed.stories)
  }

  const apis = []
  const seen = new Set()
  for (const file of vueFiles) {
    const name = file.replace(/\.vue$/, '')
    if (seen.has(name)) continue
    seen.add(name)
    apis.push({ name, ...apiOf(join(dir, file)), description: descriptionOf(join(dir, file)) })
  }
  const main = apis[0]

  const part = {
    slug: folder,
    name: main?.name ?? pascalCase(folder),
    category: category ?? 'Other',
    description: main?.description,
    credits: creditsOf(join(dir, vueFiles[0])),
    stories,
    api: apis,
    registryEntry: undefined,
  }
  part.registryEntry = {
    slug: part.slug,
    name: part.name,
    category: part.category,
    description: part.description,
    stories: stories.length,
  }
  writeFileSync(outPath, JSON.stringify(part, null, 2))
  fingerprints[folder] = fingerprint(inputs)
  registry.push(part.registryEntry)
  console.log(`generated ${folder}.json (${stories.length} stories, ${apis.length} parts)`)
}

registry.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
writeFileSync(join(outDir, 'parts.json'), JSON.stringify(registry, null, 2))
writeFileSync(fingerprintsPath, JSON.stringify(fingerprints, null, 2))

// The story modules of every part, loaded on demand. Written out as code because import.meta.glob
// cannot reach outside the site's root; plain dynamic imports can (each is its own chunk).
const loaders = folders
  .map((folder) => {
    const files = readdirSync(join(componentsDir, folder))
      .filter((file) => file.endsWith('.stories.ts'))
      .sort()
    if (!files.length) return undefined
    const imports = files.map((file) => `() => import('../../src/components/${folder}/${file}')`).join(', ')
    return `  ${JSON.stringify(folder)}: [${imports}],`
  })
  .filter(Boolean)
writeFileSync(
  join(outDir, 'stories.ts'),
  `// Generated by site/scripts/generate-meta.mjs — regenerated, not edited.\nexport const storyLoaders: Record<string, Array<() => Promise<unknown>>> = {\n${loaders.join('\n')}\n}\n`,
)
console.log(`parts.json: ${registry.length} parts`)
