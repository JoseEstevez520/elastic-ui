import { inject, provide, type App, type InjectionKey } from 'vue'
import { startFocusModality } from './focusModality'
import { setMotionPreference, type MotionPreference } from './motion'

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
  /** Status: what each state says when the part is given no label. */
  statusIdle: 'Pending',
  statusWorking: 'Working',
  statusDone: 'Done',
  statusDiscarded: 'Discarded',
  statusFlagged: 'Needs a look',
  statusError: 'Failed',
  /** WeekPillbox: its name, and what its line says for the sets of days that have one. */
  days: 'Days',
  everyDay: 'Every day',
  weekdays: 'Weekdays',
  weekends: 'Weekends',
  noDays: 'No days',
  /** DayStrip: its name, and the button that puts another time on it. */
  times: 'Times',
  addTime: 'Add a time',
  /** TreeDragHandle: its name; keys move the item from the keyboard. */
  moveItem: 'Move',
  /** IconPicker: its name, what a missing icon says, and the name of the colours. */
  icon: 'Icon',
  noIcon: 'No icon',
  color: 'Colour',
  /** Tour: its region's name, and the button that leaves it early. */
  tour: 'Guided tour',
  skip: 'Skip',
  // Navigation
  menu: 'Menu',
  mainNav: 'Main',
  pageNav: 'Previous and next page',
  sections: 'Sections',
  breadcrumb: 'Breadcrumb',
  pagesAtThisLevel: 'Pages at this level',
  sidebar: 'Sidebar',
  toggleSidebar: 'Toggle sidebar',
  onThisPage: 'On this page',
  /** A card linking to another site, after its title, for screen readers. */
  newTab: 'opens in a new tab',
  /** Pagination's landmark, and each page's name before its number. */
  pagination: 'Pagination',
  page: 'Page',
  /** Carousel: its landmark, and each slide's name before its number. */
  carousel: 'Carousel',
  slide: 'Slide',
  /** Stat's chart, to scrub with the arrow keys. */
  trendChart: 'Trend, use the arrow keys to read each point',
  /** Stat's trend, for screen readers. */
  trendUp: 'Up',
  trendDown: 'Down',
  /** Chart: how to read it from the keyboard, and its table's headings. */
  chartKeys: 'Use the arrow keys to read each value',
  series: 'Series',
  name: 'Name',
  /** Gallery's filter for everything, and its group of categories. */
  all: 'All',
  categories: 'Categories',
  /** Gallery with nothing left once narrowed. */
  nothingMatches: 'Nothing matches',
  /** Pagination's compact "Page 3 of 20". */
  of: 'of',
  /** Avatar with no photo, when it is given no name. */
  person: 'Person',
  /** Progress, for screen readers once it is complete. */
  complete: 'Complete',
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
  /** SuggestionMenu's list, for screen readers. */
  suggestions: 'Suggestions',
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
  chooseFiles: 'Choose files',
  /** FileDropZone's layer while files are held over the page. */
  dropToAttach: 'Drop to attach',
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

// Texts are read through, not copied: an app that passes a reactive object (a language switch)
// sees its parts follow the change in place, wherever they read a text while rendering.
const readThrough = <T extends object>(...layers: Partial<T>[]) =>
  new Proxy({} as T, {
    get: (_, key) => {
      for (const layer of layers) {
        const value = (layer as Record<PropertyKey, unknown>)[key]
        if (value !== undefined) return value
      }
      return undefined
    },
    // So it still spreads and serialises like a plain object (SandboxFrame sends it as JSON).
    ownKeys: () => [...new Set(layers.flatMap((layer) => Reflect.ownKeys(layer)))],
    getOwnPropertyDescriptor: (target, key) => ({
      value: Reflect.get(target, key),
      enumerable: true,
      configurable: true,
    }),
  })

/** Sets the library's texts for everything below this component. */
export function provideLabels(labels: Partial<Labels>) {
  const around = inject(LabelsKey, {})
  provide(LabelsKey, readThrough<Partial<Labels>>(labels, around))
}

/**
 * The library's texts where this component sits. Call in `setup` or in a prop's default. Read a
 * text while rendering (in the template or a computed) and it follows a language switch; a prop's
 * default is read once, when the part is created.
 */
export function useLabels(): Labels {
  return readThrough<Labels>(inject(LabelsKey, {}), defaultLabels)
}

/** One of the library's texts, for a prop's default: `{ label: () => labelFor('search') }`. */
export const labelFor = (key: keyof Labels) => () => useLabels()[key]

/** `app.use(ElasticUi, { labels: { copy: 'Copiar', … }, motion: 'full' })` sets the library app-wide. */
export const ElasticUi = {
  install(app: App, options: { labels?: Partial<Labels>; motion?: MotionPreference } = {}) {
    app.provide(LabelsKey, options.labels ?? {})
    setMotionPreference(options.motion ?? 'auto')
    startFocusModality()
  },
}
