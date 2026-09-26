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
| Select | Base | Grows out of its field (FieldMorph): the outline stretches down to hold the options and folds back once one is picked; the chosen one highlighted on opening; options in a wave (none past eight); groups, separator, `multiple`, form-ready; its width on `Select` |
| Menu | Base | Reka UI dropdown on Popover's surface; items with `icon` and `shortcut`, checks, radios, labels, separators, submenus; items in a wave from the trigger. For long lists, submenus and triggers near an edge; PopoverMorph's menu for the rest |
| AnimatedList | Base | Leaving items fade out first; the rest slide along one line when they all go the same way, and where any would cut across another (a reorder, cards reflowing in a grid) they fade and come into focus at their new place as a wave, so nothing ever overlaps; new ones wait for room; the empty state waits for the last items to go; first items come in as a wave, or just show with `:appear="false"`; `#empty` |
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
| Article | Base | `prose article`: one column whose two edges text, figures, code and tables all share; `side-by-side` that stacks from the content (Every Layout) |
| Prose | Base | An article's type in the library's tokens: grey text with darker headings, hairline-underlined links, soft inline code, lists with faint markers, quotes behind a hairline, tables as wide as the text with hairline rows; only plain elements, so parts inside keep their look (`not-prose` opts out) |
| Markdown | Special | Markdown rendered as the library's parts inside Prose: code fences, diffs, walkthroughs, agent replays, GitHub alerts, anchored headings, router links; other fences through `components` |
| TerminalReplay | Special | A terminal session played back once in view: a comment says what each command is for, the command comes in word by word, runs a moment, and its output comes in line by line (✔/✖ drawn as the library's check and cross); holds its full height; replay, copy the commands; a `terminal` fence in Markdown |
| ImageReveal | Special | An image being made: an Aurora thinking while it waits, then grains out of the light that travel to their place and form the picture before the image comes into focus. Kept, though it does not convince yet |
| Timetable | Base | A week on real time, from the TEIS web: blocks as tall as they last, tinted in their subject's colour and linking to its page, breaks across every day, no day singled out; one day with tabs on a phone, today's first, coming in as a wave; `still` for an image |
| Diagram | Base | Hand-drawn diagrams (USAGE 10): SVG classes for tinted parts with no border, lines that connect, quiet lines, the one emphasised line, a dashed grid and labels, `--diagram-color` per concept; `diagram-chip` for HTML; `Diagram` frames it, names it for screen readers and brings its parts in once on view |
| PageTransition | Special | From page to page only the content changes, lightly: the old one fades, the scroll goes back to the top, the new one fades in whole, about a third of a second in all; the Sidebar, header and breadcrumbs stay; no router needed, keyed by `page` |
| TextMorph | Base | Built on Torph (MIT): shared letters travel to their new places, the rest leave and arrive, numbers roll by place value; the library's pace, no scaling. Plain text at rest, Torph only while it changes, so letters keep their kerning. For text that becomes something else (see "Appearing is not becoming") |
| DynamicIsland | Special | A pill that morphs into each state's size and shape (a song, a timer, an upload), content leaving and coming into focus; only moves when its state changes; inline by default, `floating` to hold it at the top |
| Sidebar | Special | `SidebarLayout` + `Sidebar` + `SidebarToggle` + `SidebarLayoutHeader` (the page's bar, held at the top with a hairline once scrolled, the toggle on a phone, its height as `--page-header-height` for TableOfContents and headings); folds to a rail of icons as in SkillNet (letters erased, then the width closes 180ms later; written back on unfold), labels back as tooltips; a group opened from the rail unfolds it and moves with it; long labels fade at their edge; `plain` and `connected` (SkillNet's tab of the page); slides in as a panel on a phone |
| CommandPalette | Special | `CommandInput`, `CommandList`, `CommandGroup`, `CommandItem`, `CommandEmpty` on Reka UI's Dialog and Listbox. Clicked, its button grows into it (as DialogMorph); from an optional `shortcut` (⌘K / Ctrl+K or `/`, off by default) or `v-model:open` there is nothing to grow from, so it appears near the top as a Popover; it leaves the way it came. Finds by text, `value` and `keywords`, ignoring accents and word order; the list eases between heights (as cmdk), groups hide while empty, items coming back come into focus; the highlight survives the list shrinking under the pointer |
| Steps | Base | `Steps`, `StepsItem`, `StepsNext`. Numbered steps joined by a line: one open at a time, opening in place on Collapsible, the line filling down to it with the library's ease and the numbers reached taking the text's colour (Material's vertical stepper); `v-model` for the open step; `static` shows every step, as a guide in docs (Mintlify, Fumadocs); `aria-current="step"` |
| StatusText | Base | The library's one way of telling that something is under way: shimmers while `working`, each new text morphing from the last, and turns into what came of it; `error` turns it into what went wrong, in the danger colour, with no icon or box. Used by ChatMessage and ChatTool |
| Breadcrumbs | Base | Where the page sits, so the sidebar can keep to the main sections (Notion, Vercel, GitHub). Given as `items`, top down: a crumb whose page changes morphs into its new name (TextMorph), crumbs added or dropped come into focus or fade; a separator with `siblings` opens the other pages at the next level, as the Finder's path bar, turning down while open; a row too long for its room scrolls, held at the current page, the rest behind a fading edge |
| ActivityGrid | Special | Activity day by day as GitHub's grid, in a frame of the page's strongest tone, the months above; a tray set into its foot names where the work went, icons in a stack; pressed, it grows up over the grid as nearly opaque frosted glass, each icon gliding to its row and its words coming in once it has passed; `--activity` for its colour, `locale` for the months. After Rare UI's GitHub activity, redone |
| IconMorph | Base | An icon that becomes another as TextMorph's text does: each is drawn as the same three strokes, which travel point by point (the menu's lines crossing into a close, play's point straightening into pause's bar); strokes an icon does not need fold onto one it keeps. Menu, close, plus, minus, check, play, pause, chevrons and arrows |
| PageCard | Special | A card that becomes its page: the card's box grows to the screen (useMorphBox), its image travels to be the header, its glow (the image blurred and turning) stretches into the page's ground, its words fade as the page's come in; back, Escape or the browser's back fold it into the card. `href` makes the address the page's while open |
| ConfirmButton | Base | An action that asks in its own place, no dialog: the square widens into a pill, the bin's lid tips open, the pill splits in two (the answers' half a tone deeper, its tail pointing at the icon); confirmed, it tints with the danger colour while the action runs, then a check or what went wrong. Any icon (a sign-out, a reset). After Rare UI's delete, redone |
| Filters | Special | As Linear and Notion: a button grows into a panel of categories (PopoverMorph), a category turns it to its options (checkboxes, a search field from eight) as the box eases to their height; what is chosen stands beside it as a pill whose values morph, pressing it reopens its category, its cross takes it away and the rest slide over (AnimatedList); `count` said beside them, morphing, with Clear. `v-model` per category; the results stay the app's |
| Field | Base | A label, help and error round any control, linked for screen readers (`id`, `aria-describedby`, `aria-invalid`); help and error swap in place; `optional` |
| RadioGroup | Base | Reka UI; the dot grows from the centre; `row`, a `description` per item; linked to its Field as a group |
| Combobox | Base | Type to filter; grows out of its field as Select; options as objects or strings, `#option` slot, `emptyLabel` |
| Calendar | Base | Reka UI on `@internationalized/date`, values as ISO strings; the month's name morphs (TextMorph); today marked with a dot; `min`, `max`, `isDateDisabled`, `locale`, `weekStartsOn` |
| DatePicker | Base | A date typed by parts, or picked from the month that grows out of the field as wide as it (with a minimum) |
| AlertDialog | Base | DialogMorph with `role="alertdialog"`: only its buttons close it; Cancel focused first; `danger` for what can't be undone |

Every component above has been through the Situations checklist in `DECISIONS.md` and has a story per critical situation.

## Now · 0.2, a complete base with an identity

Every part that opens from a field or a button grows out of it (USAGE 1), and the parts with character follow the library's identity: objects that transform in place (DECISIONS, Philosophy 5 and "How objects are drawn"). Each new part gets its stories, the Situations checklist and a look in light, dark and on a phone.

1. ~~**Forms**~~ Done: Field, RadioGroup, Combobox, Calendar and DatePicker, AlertDialog, Slider, NumberField, TagsInput, FileIcon, FileUpload; Select, Combobox and DatePicker growing out of their field.
2. ~~**Sheet**~~ Done: its button's box grows into the panel at a side or the bottom, and folds back once the content has faded.
3. **From the lab into the library**:
   - ~~**ConfirmButton**~~ Done: an action that asks in its own place.
   - ~~**ActivityGrid**~~ Done: activity as GitHub's grid, its tray growing up over it into a list.
   - ~~**IconMorph**~~ Done: icons drawn as the same strokes, so one travels into another.
   - ~~**PageCard**~~ Done: a card that becomes its page, with its own address while open and the browser's back closing it.
   - **Folder**: redone bigger, with real pages and a frosted front, against its reference; dropped if it does not get there.
4. **Shared building blocks**, so every part made from here on shares one line of style and nothing is reinvented:
   - ~~**Tone tokens**~~ Done: the levels a surface sits at (sunk, base, raised) and the frame in the page's strongest tone, replacing the tones written by hand in ConfirmButton and ActivityGrid.
   - ~~**`useMorphBox`**~~ Done, Sheet on it: the recipe of a box that becomes a panel (measure, sit on the button, grow, content out first, fold back, keep the scrollbar's room), now repeated in Sheet, FieldMorph and the card to page.
   - ~~**`travel`**~~ Done (`utils/travel.ts`), AnimatedList and TagsInput on it: things that moved go to their new place, sliding along a line or fading and refocusing where any would cross another. ActivityGrid's icons keep their own path, set by where each row is.
5. **The identity over what exists** (the visual pass): tones instead of shadows (PopoverMorph, Sheet, Select, Menu…), a confirmation in its place where a dialog only asks, IconMorph where a button changes state (the menu, play, a disclosure).
6. **The rest, with the identity from the start**:
   - **HoverCard**: grows out of its link, which stays as its title; a term in Prose opening its definition.
   - **Avatar**: an icon or a photo, never initials; a group fans out on hover.
   - **Kbd** as a real key, pressed when its shortcut is.
   - **Progress**: fills on the library's ease and turns into a check.
   - **Toggle** and **ToggleGroup**, their icons morphing; **Pagination**, a mark sliding to the page.
   - Quiet, so something else leads: **Separator**, a plain **Table**, **Empty**.
7. **Names**: props and events named the same way across parts.
8. **Release 0.2.0**: tag it and hand the TEIS web its `.tgz` (each `.tgz` handed over bumps the version, so an install never keeps the old one); the library's site (the `site` branch) shows it.

## Lab

Experiments in `src/lab`, shown under Lab in Storybook and never built into the package. The direction they explore is the library's identity (DECISIONS, Philosophy 5): objects that transform in place, with a light touch of skeuomorphism, built from what the library already does. Ideas from outside (Rare UI, Family, Apple's apps) are redone from scratch in the library's own way, never copied: Rare UI's licence forbids redistributing its components, even ported.

| Experiment | Where it stands |
|---|---|
| Card to page | Done: became `PageCard`. |
| Icon morph | Done: became `IconMorph`. |
| Image aurora | Kept only as PageCard's ground (internal `ImageGlow`). |
| Folder icon | The idea is liked, the execution is not yet at the level of the reference: redo it bigger, with real pages and a frosted front, or drop it. |
| Identity: confirm in place | Done: became `ConfirmButton`. |
| Identity: activity | Done: became `ActivityGrid`. |
| Camera (blurred backgrounds, focus pulls, developing loads) | Dropped: less clean. |

## Versions

Each version comes from a kind of project: the class web gave 0.1.

- **0.2 · A complete base.** Above.
- **0.3 · Portfolio.** An image that grows into full view and folds back, a project card that opens into its case study, a filtered gallery, a Carousel.
- **0.4 · Tools**, as the class web's attendance calculator or virtual classroom panel: empty states, lists of data (a key and its value, a figure and its trend).
- **AI, when a project asks for it:**
  1. **Try again after a failure.** A quiet "Try again" beside an answer's error, which for now only says what went wrong.
  2. **Selecting in answers.** SelectionMenu over the thread: explain, quote into the composer, copy.
  3. **Message actions.** Copy, retry, edit, quiet until hovered.
  4. **Markdown in answers.** Lists, code blocks with CopyButton, flowing in as the same wave.

## The TEIS web

The library's first real project (web-del-repo), installed as a `.tgz`. It gave the router links (`to`/`as`), app-wide texts (`ElasticUi` labels), the connected sidebar tab, Markdown and Prose, Timetable, Steps, and the rules for explanation pages (USAGE 10–12). What it still has to take on: SidebarLayoutHeader for its bar, Timetable for its timetable, the rules for its explanation pages.

Not published on npm, on purpose: it is for my own projects. `"private": true` keeps npm from publishing it; projects install it from the repository at a tag, or as a `.tgz`.

## Later / ideas

- Where the DynamicIsland lives in a page with chrome: inside MorphHeader's pill, in the Sidebar's footer, or on its own at the bottom centre. For now it is inline, and needs a hidden state that morphs in from a point.
- NavTree indicator variants, such as SkillNet's "connected" pill that takes the page colour and fuses with the sidebar's edge.
- PopoverMorph flips or shifts near the screen's edges (for now `align` and `side` are chosen by hand).
- Priority+ variant for MorphHeader (show what fits, the rest in a "More" menu).
- Documentation beyond Storybook once the API settles.
- CommandPalette's nested pages (Linear's "Change status…").
- A reasoning panel for the chat was tried and left out: a single line reads better.

## Out of scope

Data tables, charts, and calendars of events to drag around (a date picker is in). Bouncing or stretching effects (see Philosophy in `DECISIONS.md`). A segmented control (a capsule with a sliding surface) was tried and left out: Tabs switch views, Filters narrow lists.
