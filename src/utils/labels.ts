import { inject, provide, type App, type InjectionKey } from 'vue'

/**
 * Every text the library writes on its own: names for screen readers, placeholders, default
 * titles. English by default; set them once for a whole app in another language with
 * `app.use(ElasticUi, { labels })`, or for part of a page with `provideLabels`. A prop on a part
 * still wins over both.
 */
export const defaultLabels = {
  // Actions
  cancel: 'Cancel',
  /** ConfirmButton. */
  delete: 'Delete',
  confirm: 'Confirm',
  /** ActivityGrid's tray. */
  mostActiveIn: 'Most active in',
  /** Term's glance. */
  seeMore: 'See more',
  close: 'Close',
  /** ImageView's thumbnail, after the image's own description. */
  fullView: 'full view',
  clear: 'Clear',
  dismiss: 'Dismiss',
  remove: 'Remove',
  copy: 'Copy',
  copied: 'Copied',
  send: 'Send',
  sending: 'Sending',
  sent: 'Sent',
  sendError: "Couldn't send",
  stop: 'Stop',
  somethingWentWrong: 'Something went wrong',
  next: 'Next',
  // Navigation
  menu: 'Menu',
  mainNav: 'Main',
  sections: 'Sections',
  breadcrumb: 'Breadcrumb',
  pagesAtThisLevel: 'Pages at this level',
  sidebar: 'Sidebar',
  toggleSidebar: 'Toggle sidebar',
  onThisPage: 'On this page',
  notifications: 'Notifications',
  // Search
  search: 'Search',
  searchPlaceholder: 'Search…',
  // Filters
  filter: 'Filter',
  filterBy: 'Filter by',
  back: 'Back',
  removeFilter: 'Remove filter',
  clearFilters: 'Clear',
  oneResult: '1 result',
  results: '{count} results',
  commandPlaceholder: 'Type a command or search…',
  noResults: 'No results',
  // Code
  replay: 'Replay',
  unchangedLines: '{count} unchanged lines',
  addedLine: 'Added',
  removedLine: 'Removed',
  // Timetable
  day: 'Day',
  // Images
  creatingImage: 'Creating image',
  // Replay
  play: 'Play',
  pause: 'Pause',
  previous: 'Previous',
  restart: 'Restart',
  stepOf: 'Step {current} of {total}',
  allow: 'Allow',
  deny: 'Deny',
  askingPermission: 'Waiting for your OK',
  // Theme
  switchToLight: 'Switch to light theme',
  switchToDark: 'Switch to dark theme',
  // Callout
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
  // Forms
  optional: 'optional',
  pickDate: 'Pick a date',
  /** NumberField's − and +. */
  decrease: 'Decrease',
  increase: 'Increase',
  /** FileUpload. `{size}` is the largest a file may be. */
  dropFiles: 'Drop files here, or browse',
  dropToAdd: 'Let go to add them',
  tooLarge: 'Larger than {size}',
  notAccepted: 'Not a kind it takes',
  uploadFailed: 'Could not upload',
  comment: 'Comment',
  commentPlaceholder: 'Write a comment…',
  rating: 'Rating',
  // Chat
  message: 'Message',
  messagePlaceholder: 'Ask anything…',
  conversation: 'Conversation',
  jumpToLatest: 'Jump to latest',
  thinking: 'Thinking',
  askAi: 'Ask AI',
  assistant: 'Assistant',
}

export type Labels = typeof defaultLabels

const LabelsKey: InjectionKey<Partial<Labels>> = Symbol('ElasticUiLabels')

/** Sets the library's texts for everything below this component. */
export function provideLabels(labels: Partial<Labels>) {
  const around = inject(LabelsKey, {})
  provide(LabelsKey, { ...around, ...labels })
}

/** The library's texts where this component sits. Call in `setup` or in a prop's default. */
export function useLabels(): Labels {
  return { ...defaultLabels, ...inject(LabelsKey, {}) }
}

/** One of the library's texts, for a prop's default: `{ label: () => labelFor('search') }`. */
export const labelFor = (key: keyof Labels) => () => useLabels()[key]

/** `app.use(ElasticUi, { labels: { copy: 'Copiar', … } })` sets the library's texts app-wide. */
export const ElasticUi = {
  install(app: App, options: { labels?: Partial<Labels> } = {}) {
    app.provide(LabelsKey, options.labels ?? {})
  },
}
