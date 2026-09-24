# Roadmap — elastic-ui

Where the library is and what comes next. Design rules live in `DECISIONS.md`; working conventions in `AGENTS.md`.

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
| Tokens (`tokens.css`) | Base | Colors with `light-dark()`, radius, eases, `mask-fade-b`, `blur-in`, `stagger-children`, disclosure keyframes |
| Button | Base | `solid`, `outline`, `ghost`, `link`; sizes; `icon`, `loading`, `href` |
| Card | Base | Composable parts; `CardImage` with `fade` |
| ThemeToggle | Base | Sun/moon from Adam Argyle's theme switch (Apache-2.0); `useTheme()` |
| Tabs | Base | Reka UI; sliding indicator; `underline` (default) and `pill` |
| Collapsible, Accordion | Base | Reka UI; grows from its header; content comes into focus as one wave; findable with Ctrl+F |
| ExpandableCard | Special | Grid card that lifts and grows to cover the grid; `default` and `ghost`; `#media` slot with `ExpandableCardImage`; `ExpandableCardText` with fading edges |
| MorphHeader | Special | Bar → pill → panel; collapses to the menu when the links don't fit (measured); `menu="always"` |
| Popover | Base | Reka UI; fades in from 97% at the corner facing its trigger, with a shadow; closes faster |
| PopoverMorph | Special | The trigger's box grows into the panel and folds back; label blurs out, content comes into focus; `align`, `side` |
| Select | Base | Reka UI; the list appears from its trigger like a Popover (shared `floatingPanelClass`); groups, separator, `multiple`, form-ready |

Every component above has been through the Situations checklist in `DECISIONS.md` and has a story per critical situation.

## Now

- [x] **One way of appearing everywhere.** ExpandableCard body (`stagger-children`) and the MorphHeader panel links (`stagger-items`) come into focus as one wave, like Collapsible and Accordion.
- [x] **Close faster than open.** Opening keeps ~0.5s so the eye can follow where things come from; closing drops to 0.3s (`morphCloseTransition`) for the card's return and the header panel folding back.

## Next

1. **Try the library in a real Vue project** (e.g. a branch of `ies-teis-daw2/extra/herramientas/web-del-repo`, same stack). Check that `@source` finds the classes, tokens can be overridden and nothing is bundled twice. The biggest remaining risk.
2. **Animated list.** Items slide to their new place when a list is filtered or reordered (Motion layout animations).
3. **Dialog born from its trigger.** The button becomes the dialog and returns to it on close; Reka UI for the focus trap.
4. **Tree / Sidebar navigation** built on Collapsible.
5. **Toast.** Arrives from an edge and leaves through it.
6. **Badge, Input** as the forms and tags need them.

## Later / ideas

- PopoverMorph flips or shifts near the screen's edges (for now `align` and `side` are chosen by hand).
- Priority+ variant for MorphHeader (show what fits, the rest in a "More" menu).
- Documentation beyond Storybook once the API settles.
- Publishing to npm.

## Out of scope

Data tables, charts, complex calendars and date pickers. Gooey, stretching or bouncing effects (see Philosophy in `DECISIONS.md`).
