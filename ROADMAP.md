# Roadmap — elastic-ui

Where the library is and what comes next. This repository is an npm workspace: the library lives in `packages/elastic-ui` and the site in `site`; root scripts delegate to them. How the library is made lives in `packages/elastic-ui/DECISIONS.md`, how to use it in `packages/elastic-ui/USAGE.md`, and working conventions in `AGENTS.md`.

## Getting started

```bash
npm install
npm run storybook   # http://localhost:6006
npm run typecheck
npm run build
```

Storybook's dev server misses Tailwind classes in newly created files; `touch packages/elastic-ui/.storybook/preview.css` makes it scan again, without a restart.

## Where it stands

Released as `v0.3.1`, on npm as `@joseestevez/vue-elastic-ui`. Around sixty public parts, each with its stories, its API and a story per critical situation (`DECISIONS.md`, Situations). Browse them by family here and in the README; the detail of each one lives in Storybook, not in this file.

- **Actions** — Button, ActionButton, ProgressButton, CopyButton, ConfirmButton, SplitActions, ThemeToggle, Toggle & ToggleGroup
- **Forms** — Input, Textarea, Field, Select, Combobox, Checkbox, Switch, RadioGroup, Slider, NumberField, TagsInput, FileUpload (default and `compact`), FileDropZone & FileIcon, Calendar, DatePicker, IconPicker, WeekPillbox, DayStrip, Filters
- **Overlays** — Popover, PopoverMorph, Menu, Tooltip, DialogMorph, AlertDialog, Sheet, Toast, SelectionMenu, SuggestionMenu, CommandPalette, Term, Tour
- **Disclosure** — Collapsible, Accordion, Tabs, Steps, ExpandableCard, SheetFlow, DynamicIsland
- **Navigation** — Sidebar, NavTree, MorphHeader, StickyHeader, PageNav, IconLinks, Breadcrumbs, TableOfContents, TreeDrag, ScrollIndicator, Pagination, PageTransition, SearchMorph
- **Content** — Card, Badge, Status, FolderIcon, Logo, Marquee, Callout, AnimatedList, Table, DescriptionList, Stat, Chart, ActivityGrid, Empty, Progress, Separator, Avatar, Timeline, Timetable, Diagram & its parts, SandboxFrame
- **Portfolio** — PageCard, ImageView, Gallery, Carousel, Glow, Glass, Liquid
- **Text and code** — TextMorph, StatusText, TruncatedText, IconMorph, Prose, Markdown, CodeBlock, CodeDiff, CodeWalkthrough, TerminalReplay
- **AI** — Chat, ChatMorph, Aurora, AgentReplay, ImageReveal, ComposeMorph

## Next · polish, and many more parts

`0.2` was a complete base and `0.3` brought the portfolio and the tools. From here the work goes two ways:

1. **Polish what is there.** A pass over the parts already built: the visual and motion details, the keyboard and screen-reader edges, the docs. The Situations checklist in `DECISIONS.md` says when a part is done; the goal is that every one passes it without an asterisk.
2. **Many more parts, and complete ones.** Grow the library well past its base with a lot more components, each whole rather than a stub: every state, its keyboard, its stories and its Situations. The **dashboard** is the guide — the kind of dense, data-heavy page a real project asks for, which is where the gaps in the current base show most. No list of parts is fixed here on purpose: the scope widens as each one is taken, and the ones that earn a place get written down once they are in.

## The library's site

The site is the library's own showcase: a landing and a place to explore every part and learn to use it, built with the library itself, so nothing on it appears from nowhere that could grow out of something.

- **Where.** The `site/` package of the workspace: a Vite + Vue 3 + vue-router app importing the library straight from `packages/elastic-ui/src` through an alias, so it always shows the current code without building the library first. It never ships with the library package. `npm run site` and `npm run site:build` in the root. Deployed on Vercel with `site` as the root directory: `site/vercel.json` installs the whole workspace from the repository's root (the site builds the library's source, which needs the library's own dependencies) and sends every path to the app, so a part's page or a story's frame opened straight still loads.
- **Pages.** A **landing** (`/`) with `MorphHeader` and no sidebar: one line on the idea, one live demo, three or four short sections each with one live part, and the rules in brief. **Getting started** (`/docs`) from `USAGE.md`. **Principles** (`/docs/principles`) from `DECISIONS.md` and `USAGE.md`, a live example per rule. **Explore** (`/components`): every public part grouped by family, its groups as the only filter, a card growing into the part's page. A **part's page** (`/components/:name`): the description from its doc comment, previews rendered from its stories with `composeStories`, the source a tab away, the Situations, an API table from `vue-component-meta`, the keyboard notes, and previous and next.
- **Layout and look.** `SidebarLayout` + `Sidebar` (`connected`) + `NavTree`, with `SidebarLayoutHeader` holding the breadcrumbs and `ThemeToggle`; `TableOfContents` on long pages, `PageTransition` between them. Light and dark from the start, and a phone.
- **Order of work.** Scaffold; one part's page end to end (Button), to get it right before scaling; a registry generated from `packages/elastic-ui/src/components/*` and their stories, so a new part shows up on its own; Getting started and Principles; landing; the card-to-page transition; a pass in light, dark and at phone width.
- **Frames.** A story's preview fits its frame on its own, with nothing set per part (`site/story-fit.ts`): it keeps the full width a page would give it, is shrunk when wider than the frame (a toolbar on a phone), centred when it leaves the frame mostly empty, and the frame takes its height. Measured at rest only, so a panel opening moves nothing already there. A story of the page itself (`layout: 'fullscreen'`: a header, a sidebar, a table of contents) gets an iframe of its own (`/frame/:part/:story`), where it scrolls, sticks and breaks as on a real page: drawn at a desktop's width (1024px) and scaled down into the frame, or at the frame's own width on a phone. `npm run site:check` builds the site and checks every story at a desktop's and a phone's width (`site/scripts/check-frames.mjs`): nothing sticks out of its frame or is shrunk past half, nothing throws or logs an error.
- **Rules.** Everything in English; follow `DECISIONS.md` and `USAGE.md`; do not change the library's `src/` to make the site work. Write what is missing in `site/SITE-NEEDS.md` for the library to do first. No attribution in commits.

## The TEIS web

The library's first real project (web-del-repo), installed as a `.tgz`. It gave the router links (`to`/`as`), app-wide texts (`ElasticUi` labels), the connected sidebar tab, Markdown and Prose, Timetable, Steps, and the rules for explanation pages (`USAGE.md` 10–12). What it still has to take on: `SidebarLayoutHeader` for its bar, `Timetable` for its timetable, and the rules for its explanation pages.

## Lab

Experiments in `src/lab`, shown under Lab in Storybook and never built into the package. They explore the library's identity (`DECISIONS.md`, Philosophy 5): objects that transform in place, with a light touch of skeuomorphism, built from what the library already does. Ideas from outside are redone from scratch in the library's own way, never copied: Rare UI's licence forbids redistributing its components, even ported.

Open: a **tear-off calendar** (Date tile): the day's page lifting over the binding. It works, but does not excite; kept aside.

## Later / ideas

- **A proper time-picker.** A real part for picking a time of day, replacing the native `<input type="time">` used raw across projects (inconsistent, browser-styled). In the vein of `DatePicker`: its own display, keyboard and mobile behaviour, not a thin wrapper around the native control.
- **Objects in the bin's family** (ConfirmButton, FileIcon): a recognisable thing whose parts move, at a size where the gesture reads without explaining it. A padlock as a private/public switch; a copy as a sheet that doubles for CopyButton.
- **From other products** (Family, Things, Apple, Emil Kowalski, Rauno), to redo our own way: drag to close a Sheet (Vaul); hold to confirm (Rauno's Hold Enter); toasts stacked by tone, fanning out on hover (Sonner); what is pending travels to where it will live (Family).
- Where the `DynamicIsland` lives in a page with chrome, and a hidden state it morphs in from.
- A Priority+ variant for `MorphHeader` (show what fits, the rest in a "More" menu), and `CommandPalette`'s nested pages (Linear's "Change status…").
- Documentation beyond Storybook once the API settles.

## Out of scope

Bouncing or stretching effects (`DECISIONS.md`, Philosophy 2). A segmented control (a capsule with a sliding surface) was tried and left out: Tabs switch views, Filters narrow lists.
