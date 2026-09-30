import type { Component } from 'vue'
import { composeStories } from '@storybook/vue3-vite'
import registryJson from './generated/parts.json'
import { storyLoaders } from './generated/stories'

/** A part in the registry the nav and the explore page read (generated/parts.json). */
export interface RegistryEntry {
  slug: string
  name: string
  category: string
  description?: string
  stories: number
}

/** A story, as extracted from its stories file: its title, docs, source and where it lives. */
export interface StoryInfo {
  key: string
  name: string
  docs?: string
  source: string
  file: string
  situation?: boolean
}

export interface ApiEntry {
  name: string
  type: string
  description?: string
}

export interface ApiProp extends ApiEntry {
  required?: boolean
  default?: string
}

/** The API of one component of the family, as written in its source. */
export interface ApiPart {
  name: string
  props: ApiProp[]
  events: ApiEntry[]
  slots: ApiEntry[]
  description?: string
}

/** Everything a part's page needs (generated/<slug>.json). */
export interface PartData {
  slug: string
  name: string
  category: string
  description?: string
  credits?: string[]
  stories: StoryInfo[]
  api: ApiPart[]
}

export const registry = registryJson as RegistryEntry[]

const dataLoaders = import.meta.glob('./generated/*.json', { import: 'default' })

export interface LoadedPart {
  data: PartData
  /** The part's stories as renderable components, keyed by the story's export name. */
  components: Record<string, Component>
}

/** A part's generated data plus its live stories, or `undefined` when the slug is unknown. */
export async function loadPart(slug: string): Promise<LoadedPart | undefined> {
  const load = dataLoaders[`./generated/${slug}.json`]
  if (!load) return undefined
  const data = (await load()) as PartData
  const components: Record<string, Component> = {}
  for (const loadModule of storyLoaders[slug] ?? []) {
    const module = (await loadModule()) as Parameters<typeof composeStories>[0]
    Object.assign(components, composeStories(module))
  }
  return { data, components }
}

/** The parts around this one in the registry's order, for the page's previous/next. */
export function neighborsOf(slug: string): { previous?: RegistryEntry; next?: RegistryEntry } {
  const index = registry.findIndex((entry) => entry.slug === slug)
  return { previous: registry[index - 1], next: registry[index + 1] }
}

export interface RegistryGroup {
  category: string
  parts: RegistryEntry[]
}

/**
 * The registry as groups in Storybook's order (SITE.md §4), the entries in each narrowed to those
 * matching a query — by name or by group, so typing a group's name keeps it whole. Shared by the
 * sidebar's NavTree and the Components page's sections, so both agree on what a search matches.
 */
export function groupedRegistry(query = ''): RegistryGroup[] {
  const q = query.trim().toLowerCase()
  const matches = (entry: RegistryEntry) => !q || entry.name.toLowerCase().includes(q) || entry.category.toLowerCase().includes(q)
  const byCategory = new Map<string, RegistryEntry[]>()
  for (const entry of registry) {
    if (!matches(entry)) continue
    const list = byCategory.get(entry.category)
    if (list) list.push(entry)
    else byCategory.set(entry.category, [entry])
  }
  return [...byCategory].map(([category, parts]) => ({ category, parts }))
}
