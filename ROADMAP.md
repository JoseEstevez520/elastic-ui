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
| AnimatedList | Base | Motion layout; items slide to their new place, leaving ones fade out before the rest close the gap, new ones wait for room; first items come in as a wave; `#empty` |
| DialogMorph | Special | Reka UI Dialog; the button's box travels to the middle and grows into the dialog, folds back on close; label fades out in place; content scrolls only once the box has landed |
| NavTree | Base | Side navigation on Collapsible; one indicator slides to the active item and takes on the clip of the groups around it; groups holding the active item open on their own; `icon` on items and groups; `aria-current` |
| Toast | Base | `toast()` from anywhere, one `<Toaster>`; arrives from the edge, fades and folds its place away; entrances queued so nothing overlaps; three at most, the oldest fading out as a new one arrives (as in Sonner); pauses on hover and focus; `aria-live`; six positions |
| Tooltip | Base | Reka UI; Popover's surface, smaller; `TooltipGroup` shows the next ones at once while moving along |
| Badge, BadgeCount | Base | `soft`, `outline`, `solid`; `icon`, a colour dot; `compact` folds to the icon and unfolds its label on hover and focus; `removable`; BadgeCount's digits roll by place value (TextMorph) |
| Input, Textarea | Base | A hairline that darkens on focus, no halo; `icon`, `invalid`; Textarea grows with its text |
| Checkbox, Switch | Base | Reka UI; the check is drawn along its stroke and turns into the dash for in between; the Switch's knob slides on the library's ease |
| CopyButton | Base | Copy turns into a check, and back after two seconds; its label morphs with TextMorph |
| ProgressButton | Base | A button that becomes its own progress: the amount fills it and counts up beside the morphing label, then the fill turns green (done) or red (error) and it goes back to itself; a sweep when there is no amount |
| SearchMorph | Special | A magnifier that widens into the field around it (button, `/` or ⌘K), folding back when left empty; no box once open, as Apple's, or `soft` as Vercel's |
| ComposeMorph | Special | A button that becomes a small form to write something short (a comment, a reply, a note, feedback with an optional rating); sends with a quiet chevron that turns into its own progress, or ⌘↵; turns into a thank-you and folds back by itself |
| SelectionMenu | Special | Taken from Curio: selecting text snaps to whole words and paints one rounded band per line, with a bar of actions above it (`SelectionMenuItem`) |
| Chat | Special | `Chat`, `ChatThread`, `ChatMessage`, `ChatComposer`. Your message just shows in a round bubble; the answer flows in as a wave at a steady pace, however unevenly the model sends it (Streamdown, llm-ui, FlowToken); until its first words, one shimmering line says what it is doing, morphing from step to step; the composer's button pulls out of its pill like a drop, and turns into stop while answering; `ChatTool` tells a step in one line that shimmers while it runs and morphs into what it found, opening to its `ChatSources` as lines hanging from a fine thread |
| ChatMorph | Special | An orb of aurora that grows into a chat box of its own and folds back into it; no icon, no header, only a cross; the conversation ends under the cross's row in a soft fade; the composer and your messages turn to glass over the colour; closes with Escape, the cross or a click elsewhere, keeping the conversation; floating at the bottom right, or inline |
| Aurora | Special | Blurred lights drifting under a fine grain over a wash of the same colours (accent, violet, peach, pink; `--aurora-1…4`); follows the work: thinking gathers and hurries them, answering spreads them, `settled` calms them to a tint, easing the pace so nothing jumps |
| TableOfContents | Special | "On this page": a mark on a hairline slides to the section being read and takes its height; a click scrolls there with the mark going straight to it; `offset` for a fixed header; placed at once on load |
| CodeBlock | Base | A soft fill, no border; its file or language on a quiet caption with a CopyButton, or the button waiting in the corner of a bare snippet; long lines scroll and fade at the side that has more; highlighted markup through the slot, plain `code` copied |
| Callout | Base | GitHub's alerts (note, tip, important, warning, caution): an icon and a soft tint of its colour, no border; `--color-warning` added for it |
| TextMorph | Base | Built on Torph (MIT): shared letters travel to their new places, the rest leave and arrive, numbers roll by place value; the library's pace, no scaling. For text that becomes something else (see "Appearing is not becoming") |
| DynamicIsland | Special | A pill that morphs into each state's size and shape (a song, a timer, an upload), content leaving and coming into focus; only moves when its state changes; inline by default, `floating` to hold it at the top |
| Sidebar | Special | `SidebarLayout` + `Sidebar` + `SidebarToggle`; folds to a rail of icons as in SkillNet (letters erased, then the width closes 180ms later; written back on unfold), labels back as tooltips; a group opened from the rail unfolds it and moves with it; long labels fade at their edge; `plain` and `connected` (SkillNet's tab of the page); slides in as a panel on a phone |

Every component above has been through the Situations checklist in `DECISIONS.md` and has a story per critical situation.

## Now

- [x] **One way of appearing everywhere.** ExpandableCard body (`stagger-children`) and the MorphHeader panel links (`stagger-items`) come into focus as one wave, like Collapsible and Accordion.
- [x] **Close faster than open.** Opening keeps ~0.5s so the eye can follow where things come from; closing drops to 0.3s (`morphCloseTransition`) for the card's return and the header panel folding back.

## Next

1. **Try the library in a real Vue project** (e.g. a branch of `ies-teis-daw2/extra/herramientas/web-del-repo`, same stack). Check that `@source` finds the classes, tokens can be overridden and nothing is bundled twice. The biggest remaining risk.
2. **Command palette.** DialogMorph with a search field and a list.
3. **Steps.** Numbered steps joined by a line that fills as you go, for step-by-step visuals such as the TEIS web's agents.

### AI chat, next

Done so far: the composer (its button pulling out like a drop, send turning into stop), the answer flowing in as a wave, one shimmering line for what it is doing, the steps it takes (ChatTool) and ChatMorph over an Aurora. A reasoning panel was tried and left out: a single line reads better.

1. **Selecting in answers.** SelectionMenu over the thread: explain, quote into the composer, copy.
2. **Message actions.** Copy, retry, edit, quiet until hovered.
3. **Markdown in answers.** Lists, code blocks with CopyButton, flowing in as the same wave.

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

Data tables, charts, complex calendars and date pickers. Bouncing or stretching effects (see Philosophy in `DECISIONS.md`).
