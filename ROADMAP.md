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

Every component above has been through the Situations checklist in `DECISIONS.md` and has a story per critical situation.

## Now

- [ ] **One way of appearing everywhere.** ExpandableCard body and the MorphHeader panel use `blur-in` / `stagger-children`, like Collapsible and Accordion.
- [ ] **Close faster than open.** Opening keeps ~0.5s so the eye can follow where things come from; closing drops to ~0.3s (Material guidance: exits shorter than entrances).

## Next

1. **Try the library in a real Vue project** (e.g. a branch of `ies-teis-daw2/extra/herramientas/web-del-repo`, same stack). Check that `@source` finds the classes, tokens can be overridden and nothing is bundled twice. The biggest remaining risk.
2. **Select / Popover.** The panel grows out of its trigger (clip-path, never scaling text); Reka UI for keyboard, typeahead and positioning. A morphing variant (trigger becomes the panel) for richer popovers.
3. **Animated list.** Items slide to their new place when a list is filtered or reordered (Motion layout animations).
4. **Dialog born from its trigger.** The button becomes the dialog and returns to it on close; Reka UI for the focus trap.
5. **Tree / Sidebar navigation** built on Collapsible.
6. **Toast.** Arrives from an edge and leaves through it.
7. **Badge, Input** as the forms and tags need them.

## Later / ideas

- Priority+ variant for MorphHeader (show what fits, the rest in a "More" menu).
- Documentation beyond Storybook once the API settles.
- Publishing to npm.

## Out of scope

Data tables, charts, complex calendars and date pickers. Gooey, stretching or bouncing effects (see Philosophy in `DECISIONS.md`).
