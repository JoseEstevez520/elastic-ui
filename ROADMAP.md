# Roadmap — elastic-ui

Where the library is and what comes next. Design rules live in `DECISIONS.md`, rules for using it in a project in `USAGE.md`, and working conventions in `AGENTS.md`.

## Getting started

```bash
npm install
npm run storybook   # http://localhost:6006
npm run typecheck
npm run build
```

Storybook's dev server sometimes misses classes in newly created files; restart it if a new story renders unstyled.

## Done

| Component | Tier | Notes |
|---|---|---|
| Tokens (`tokens.css`) | Base | Colors with `light-dark()`, radius, eases (`--ease-glide` among them), `shadow-overlay` / `shadow-soft`, `mask-fade-b`, `blur-in`, `stagger-children` / `stagger-items`, `scrollbar-subtle`, disclosure and popover keyframes |
| Button | Base | `solid`, `outline`, `ghost`, `link`; sizes; `icon`, `loading`, `href` |
| Card | Base | Composable parts; `CardImage` with `fade` |
| ThemeToggle | Base | Sun/moon from Adam Argyle's theme switch (Apache-2.0); `useTheme()` |
| Tabs | Base | Reka UI; sliding indicator; `underline` (default) and `pill` |
| Collapsible, Accordion | Base | Reka UI; grows from its header; content comes into focus as one wave; findable with Ctrl+F |
| ExpandableCard | Special | Grid card that lifts and grows to cover the grid; `default` and `ghost`; `#media` slot with `ExpandableCardImage`; `ExpandableCardText` with fading edges |
| MorphHeader | Special | Bar → pill → panel; collapses to the menu when the links don't fit (measured); `menu="always"` |
| Popover | Base | Reka UI; fades in from 97% at the corner facing its trigger, with a soft shadow; content comes in as a wave; closes faster |
| PopoverMorph | Special | The trigger's box grows into the panel and folds back, staying above its neighbours until it has; label blurs out, content comes into focus; `align`, `side`; `role="menu"` with `PopoverMorphItem` (arrow keys, typeahead, closes on choosing) for short menus |
| Select | Base | Reka UI; the list appears from its trigger like a Popover (shared `floatingPanelClass`), options in a wave from the trigger outwards (none past eight); groups, separator, `multiple`, form-ready |
| Menu | Base | Reka UI dropdown on Popover's surface; items with `icon` and `shortcut`, checks, radios, labels, separators, submenus; items in a wave from the trigger. For long lists, submenus and triggers near an edge; PopoverMorph's menu for the rest |
| AnimatedList | Base | Motion layout; items slide to their new place, leaving ones fade out before the rest close the gap, new ones wait for room; first items come in as a wave, or just show with `:appear="false"`; `#empty` |
| DialogMorph | Special | Reka UI Dialog; the button's box travels to the middle and grows into the dialog, folds back on close; label fades out in place; content scrolls only once the box has landed |
| NavTree | Base | Side navigation on Collapsible; one indicator slides to the active item and takes on the clip of the groups around it; groups holding the active item open on their own; `icon` on items and groups; `aria-current` |
| Toast | Base | `toast()` from anywhere, one `<Toaster>`; arrives from the edge, fades and folds its place away; entrances queued so nothing overlaps; three at most, the oldest fading out as a new one arrives (as in Sonner); pauses on hover and focus; `aria-live`; six positions |
| Tooltip | Base | Reka UI; Popover's surface, smaller; `TooltipGroup` shows the next ones at once while moving along |
| Badge, BadgeCount | Base | `soft`, `outline`, `solid`; `icon`, a colour dot; `compact` folds to the icon and unfolds its label on hover and focus; `removable`; BadgeCount's digits roll by place value (TextMorph) |
| Input, Textarea | Base | A hairline that darkens on focus, no halo; `icon`, `invalid`; Textarea grows with its text |
| Checkbox, Switch | Base | Reka UI; the check is drawn along its stroke and turns into the dash for in between; the Switch's knob slides on the library's ease |
| CopyButton | Base | Copy turns into a check, and back after two seconds; its label morphs with TextMorph |
| ProgressButton | Base | A button that becomes its own progress: the amount fills it and counts up beside the morphing label, then the fill turns green (done) or red (error) and it goes back to itself; with no amount, the label shimmers |
| SearchMorph | Special | A magnifier that widens into the field around it (button, `/` or ⌘K), folding back when left empty; no box once open, as Apple's, or `soft` as Vercel's |
| ComposeMorph | Special | A button that becomes a small form to write something short (a comment, a reply, a note, feedback with an optional rating); sends with a quiet chevron that turns into its own progress, or ⌘↵; turns into a thank-you and folds back by itself |
| SelectionMenu | Special | Taken from Curio: selecting text snaps to whole words and paints one rounded band per line, with a bar of actions above it (`SelectionMenuItem`) |
| Chat | Special | `Chat`, `ChatThread`, `ChatMessage`, `ChatComposer`. Sending glides your message to the top, leaving room below for the answer to grow into (as ChatGPT and Claude); once the answer reaches the bottom the view follows it down, gliding at the pace the text comes; scrolling up lets go, with a button back to the end; your message just shows in a round bubble; the answer flows in as a wave at a steady pace, however unevenly the model sends it (Streamdown, llm-ui, FlowToken); until its first words, one shimmering line says what it is doing, morphing from step to step; the composer's button pulls out of its pill like a drop, and turns into stop while answering; `ChatTool` tells a step in one line that shimmers while it runs and morphs into what it found, opening to its `ChatSources` as lines hanging from a fine thread; the first step takes over the thinking line, morphing from its words where they stood; a step that fails says so quietly and opens to what went wrong (`ChatToolDetail` with `error`: the alert and the danger colour, only once opened), while an answer that fails (`error`) turns its line into that, in the danger colour with the alert beside it |
| ChatMorph | Special | An orb of aurora that grows into a chat box of its own and folds back into it; no icon, no header, only a cross; the conversation ends under the cross's row in a soft fade; the composer and your messages turn to glass over the colour; closes with Escape, the cross or a click elsewhere, keeping the conversation; floating at the bottom right, or inline |
| Aurora | Special | Blurred lights drifting under a fine grain over a wash of the same colours (accent, violet, peach, pink; `--aurora-1…4`); follows the work: thinking gathers and hurries them, answering spreads them, `settled` calms them to a tint, easing the pace so nothing jumps |
| TableOfContents | Special | "On this page": a mark on a hairline slides to the section being read and takes its height; a click scrolls there with the mark going straight to it; `offset` for a fixed header; placed at once on load |
| CodeBlock | Base | A soft fill, no border; its file or language on a quiet caption with a CopyButton, or the button waiting in the corner of a bare snippet; long lines scroll and fade at the side that has more; highlighted markup through the slot, plain `code` copied |
| Callout | Base | GitHub's alerts (note, tip, important, warning, caution): an icon and a soft tint of its colour, no border; `--color-warning` added for it |
| CodeWalkthrough | Special | A guide that builds code step by step (Stripe, Code Hike): steps on one side, the code held in view on the other, turning into each step's code in three beats (lines that go fade, lines that stay slide, new ones come in as a wave); what the step adds, or its `highlight`, stands out |
| ScrollIndicator | Base | A scrollbar reduced to a short line of fixed length, as iOS's but always the same size: hidden at rest, it flashes as it appears (Apple's `flashScrollIndicators`), shows while scrolling or near the edge, can be dragged; in every ChatThread |
| CodeDiff | Base | A file's change: removed lines tinted red, added green, `+n −n` on the caption, untouched runs folded; plays the edit once in view (the lines that go turn red, the new ones open in), with replay |
| AgentReplay | Special | A session with an agent played back to explain it: your request, each step shimmering while it runs and turning into what it did (a search, a read, an edit as a CodeDiff, a command's output), steps that ask permission (Allow / Deny) or are refused, a subagent's own session inside its step, the answer flowing in; a note per moment beside it; shows the request at rest and plays once in view, one at a time, over an Aurora that follows the work, with play, pause, back and forth; compared side by side (`layout="stacked"`) or one after another, never through a selector |
| TextMorph | Base | Built on Torph (MIT): shared letters travel to their new places, the rest leave and arrive, numbers roll by place value; the library's pace, no scaling. Plain text at rest, Torph only while it changes, so letters keep their kerning. For text that becomes something else (see "Appearing is not becoming") |
| DynamicIsland | Special | A pill that morphs into each state's size and shape (a song, a timer, an upload), content leaving and coming into focus; only moves when its state changes; inline by default, `floating` to hold it at the top |
| Sidebar | Special | `SidebarLayout` + `Sidebar` + `SidebarToggle`; folds to a rail of icons as in SkillNet (letters erased, then the width closes 180ms later; written back on unfold), labels back as tooltips; a group opened from the rail unfolds it and moves with it; long labels fade at their edge; `plain` and `connected` (SkillNet's tab of the page); slides in as a panel on a phone |
| CommandPalette | Special | `CommandInput`, `CommandList`, `CommandGroup`, `CommandItem`, `CommandEmpty` on Reka UI's Dialog and Listbox. Clicked, its button grows into it (as DialogMorph); from an optional `shortcut` (⌘K / Ctrl+K or `/`, off by default) or `v-model:open` there is nothing to grow from, so it appears near the top as a Popover; it leaves the way it came. Finds by text, `value` and `keywords`, ignoring accents and word order; the list eases between heights (as cmdk), groups hide while empty, items coming back come into focus; the highlight survives the list shrinking under the pointer |
| Steps | Base | `Steps`, `StepsItem`, `StepsNext`. Numbered steps joined by a line: one open at a time, opening in place on Collapsible, the line filling down to it with the library's ease and the numbers reached taking the text's colour (Material's vertical stepper); `v-model` for the open step; `static` shows every step, as a guide in docs (Mintlify, Fumadocs); `aria-current="step"` |
| StatusText | Base | The library's one way of telling that something is under way: shimmers while `working`, each new text morphing from the last, and turns into what came of it; `error` turns it into what went wrong, in the danger colour, with no icon or box. Used by ChatMessage and ChatTool |
| Breadcrumbs | Base | Where the page sits, so the sidebar can keep to the main sections (Notion, Vercel, GitHub). Given as `items`, top down: a crumb whose page changes morphs into its new name (TextMorph), crumbs added or dropped come into focus or fade; a separator with `siblings` opens the other pages at the next level, as the Finder's path bar, turning down while open; a row too long for its room scrolls, held at the current page, the rest behind a fading edge |
| Filters | Special | As Linear and Notion: a button grows into a panel of categories (PopoverMorph), a category turns it to its options (checkboxes, a search field from eight) as the box eases to their height; what is chosen stands beside it as a pill whose values morph, pressing it reopens its category, its cross takes it away and the rest slide over (AnimatedList); `count` said beside them, morphing, with Clear. `v-model` per category; the results stay the app's |

Every component above has been through the Situations checklist in `DECISIONS.md` and has a story per critical situation.

## Now

- [x] **One way of appearing everywhere.** ExpandableCard body (`stagger-children`) and the MorphHeader panel links (`stagger-items`) come into focus as one wave, like Collapsible and Accordion.
- [x] **Close faster than open.** Opening keeps ~0.5s so the eye can follow where things come from; closing drops to 0.3s (`morphCloseTransition`) for the card's return and the header panel folding back.

## Next

1. ~~**Try the library in a real Vue project**~~ Done with the TEIS web (web-del-repo). What it brought: groups open on load no longer animate; `to`/`as` for router links on NavTreeItem, NavTreeGroup (a section with its own page) and Button; `toggleLabel` on Sidebar; app-wide texts (`ElasticUi` labels); TableOfContents `scroller`; the connected tab's corners painted without shadows; tree-shaking (`@__PURE__`); USAGE notes on installing with `npm pack`, the theme script and what scrolls.
2. ~~**Command palette.**~~ Done. Nested pages (Linear's "Change status…") left for later.
3. ~~**Steps.**~~ Done. The TEIS web's `AgentesPorPasos` can move onto it.

### For guides and notes (from the TEIS web)

1. **Markdown into the library's parts.** A markdown-it plugin (or a `Prose` part) that renders code fences as CodeBlock, GitHub alerts as Callout, and lets CodeWalkthrough, CodeDiff and AgentReplay be written in the `.md`. The TEIS web does this by hand today.
2. **Prose.** Type for an article: headings, lists, tables, links, inline code, quotes, in the library's tokens and spacing, so a notes site does not invent its own.
3. **A time grid**, from the TEIS web's timetable: blocks as long as they last, the "now" line in today's column, a single day on a phone.
4. **Navigation pattern in USAGE:** sections in the Sidebar, the pages under them in Breadcrumbs' siblings.

### AI chat, next

Done so far: the composer (its button pulling out like a drop, send turning into stop), the answer flowing in as a wave, one shimmering line for what it is doing, the steps it takes (ChatTool) and ChatMorph over an Aurora. A reasoning panel was tried and left out: a single line reads better.

1. **Try again after a failure.** A quiet "Try again" beside an answer's error, which for now only says what went wrong.
2. **Selecting in answers.** SelectionMenu over the thread: explain, quote into the composer, copy.
3. **Message actions.** Copy, retry, edit, quiet until hovered.
4. **Markdown in answers.** Lists, code blocks with CopyButton, flowing in as the same wave.

## Later / ideas

- Where the DynamicIsland lives in a page with chrome: inside MorphHeader's pill, in the Sidebar's footer, or on its own at the bottom centre. For now it is inline, and needs a hidden state that morphs in from a point.
- NavTree indicator variants, such as SkillNet's "connected" pill that takes the page colour and fuses with the sidebar's edge.
- AnimatedList: items crossing while reordering (for now they slide past each other).
- PopoverMorph flips or shifts near the screen's edges (for now `align` and `side` are chosen by hand).
- Organize Storybook and the docs by family (actions, forms, overlays, disclosure, collections, navigation) instead of Base / Special, with each morph variant next to its plain one.
- Priority+ variant for MorphHeader (show what fits, the rest in a "More" menu).
- Documentation beyond Storybook once the API settles.
- Publishing to npm.

## Out of scope

Data tables, charts, complex calendars and date pickers. Bouncing or stretching effects (see Philosophy in `DECISIONS.md`). A segmented control (a capsule with a sliding surface) was tried and left out: Tabs switch views, Filters narrow lists.
