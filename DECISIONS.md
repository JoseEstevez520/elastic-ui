# Design decisions — elastic-ui

A Vue component library for my own projects, built to adapt to very different use cases.

## Philosophy

**Clean interfaces where things transform instead of appearing.**

1. **Continuity: nothing appears or disappears without a transition.** The interface behaves like a physical space: everything comes from somewhere and goes somewhere, so the eye can follow it. The card grows out of its cell, the header stretches into a panel, the tab indicator travels to the new tab. A click never swaps the whole screen at once.
2. **Transform, not spectacle.** Shape and position change with the one emphasized ease, and nothing more: no stretching text, no bouncing. A liquid join (gooey) is welcome where it tells something, two shapes that belong together meeting or parting, as ChatComposer's send button pulling out of the pill like a drop. Motion is there to explain what happened, not to show off.
3. **Fewer boxes.** Order comes from space, typography and color first. Borders and backgrounds only where they add something, such as an interactive surface or real grouping. A box can appear when it is needed (on hover, when open) rather than sit there at rest.
4. **Accessible by default.** Keyboard, Escape, focus and `prefers-reduced-motion`.

### Motion rules

- **Close faster than open.** Opening takes ~0.5s so the eye can follow where things come from; closing takes 0.3s, since on the way out you only want it gone (Material: exits shorter than entrances). Content leaves at once, before the shape folds.
- **Time follows distance.** A shape that grows in place, a little way, opens in ~350ms (SearchMorph widening into its field, PopoverMorph); one that changes more of itself ~450ms (DynamicIsland); a box that travels across the screen or grows into a whole panel ~500ms (DialogMorph, ChatMorph, MorphHeader). Closing is always the shorter one, ~250–300ms. Content that comes into a growing box starts about halfway through the journey.
- **Text never scales.** Morphing parts animate their position only (`layout="position"`); boxes take their new size at once and text reflows. A scaled box is stretched text. The one exception is a floating panel that appears rather than morphs (Popover): it grows from 97%, too little to read as stretched.
- **A box that becomes a panel changes its real size.** Its edges travel from the button's box to the panel's (`top`, `left`, `width`, `height`, or only `height` for a field), taking the panel's radius on the way; it is never scaled into place. The recipe, as FieldMorph, PopoverMorph, ChatMorph and Sheet follow it:
  1. The content is laid out at the panel's size from the start, pinned to the edge the box grows towards, and clipped by the box: it is uncovered in place, never squeezed or stretched. What depends on the width is measured once the content has the panel's width (a sheet's height from its wrapped content).
  2. The box starts exactly on the button's box, placed there without moving, and only then grows; it never starts from nothing or from a corner of the screen.
  3. Opening, the content comes into focus as a wave from about halfway through; closing, it fades at once (`contentOut`), and only then does the box fold back.
  4. It stays above its neighbours until it has folded all the way back.
  5. The button's label waits while the box is out, and comes back into focus as the box lands on it; the focus goes back to the button.
  Scaling a shared box (`layoutId`) is only for one that grows a little and in proportion, as DialogMorph's into a small dialog: grown much, or into a tall panel, it reads as a zoom rather than a change of shape.
- **Leaving comes before making room.** An item that goes (a tag, a file, a list item) fades where it stands, keeping its room, so nothing is squeezed while it goes; then its room closes and the rest move. Along one line they slide over; if any would cross another (a change of line, a reorder, cards reflowing), all that move fade where they were and come into focus where they land, as a wave (AnimatedList, TagsInput, FileUpload).
- **One way to appear: a fade.** Content that shows up fades in once the shape has nearly arrived, and fades out before it leaves. No wipes, slides or typewriters on top of a morph; that is too much motion. Content being read comes into focus rather than switching on (`blur-in`: opacity and a 2px blur, as in Magic UI's Blur Fade, without its offset). Several blocks do it as one flowing wave: 0.45s each, only 40ms apart so the fades overlap instead of reading as steps, capped at the eighth (`stagger-children`); they leave all at once.
  - The one typewriter is the Sidebar's labels, taken from SkillNet: folding, their letters are erased from the end, and unfolding they are written back from the start, a touch later down each row. Only there, where a label shrinks to nothing and grows back along its own line; a label too long for its row still ends in a fading edge.
- **Appearing is not becoming.** Content that was not there comes in with `blur-in` (and as a wave when there is more than one block). Text that was there and takes a new value, a label, a status or a count, turns into it with `TextMorph`: its shared letters travel to their new places. Only short text morphs; a paragraph that changes is simply replaced.
- **One thing leads.** On a screen, one movement draws the eye. When a morph is the main one (the MorphHeader growing into its panel, a card lifting), what changes around it, such as an icon or a label, changes quietly instead of animating on its own and competing with it.
- **What is open when the page loads just shows.** Entrances play for a change the user makes, not for the first render: an Accordion or a NavTree group open from the start is simply there (`useHasChanged`).
- **Truncate with a fading edge, not an ellipsis**, in anything that morphs. An ellipsis is on or off and cannot be animated; a `mask-image` edge can. When the line gets room, the visible part stays still and the edge plus the hidden rest fade in with the same timing as everything else (`ExpandableCardText`).
- **Heights don't depend on width** in anything that morphs, so a line count change never lands as a jump mid-animation.

## Situations

A component is not done until it works in every situation below, and each critical one has its own story so it keeps being checked.

- **Count**: 1, 2, an odd number, many.
- **Content**: very long and empty text, with and without media, mixed.
- **Size**: mobile (one column), desktop, resizing while open.
- **Theme**: light and dark.
- **Keyboard**: Tab, Enter, Escape, and focus never lost when an element unmounts.
- **Reduced motion**: `prefers-reduced-motion` is respected (`MotionConfig reduced-motion="user"`).
- **Coexistence**: two instances on the same page.
- **Server rendering**: no `window`, `document` or observers touched outside `onMounted`.
- **Languages**: labels can be much longer in another language. Layout decisions are measured from the content where possible (the MorphHeader collapses to its menu when the links don't fit), not guessed from a breakpoint.

## Performance

- Animate only `transform` and `opacity` (GPU-composited). Layout properties only where there is no alternative, and only for the length of a transition.
- Listeners passive, observers disconnected on unmount, state updated only when it actually changes.
- Images `loading="lazy"` and `decoding="async"`.
- Dependencies external to the bundle (`vue`, `motion-v`, `reka-ui`…), never bundled twice.
- Tree-shakable: every top-level call that builds a value (`cva(...)`) is marked `/* @__PURE__ */`, so a project that imports one part does not carry the rest. The build keeps one file per module (`preserveModules`), so a bundler drops whole files it never reaches and each part's weight can be measured.

## Scope

- **A minimal base** (Button, Input, Badge…): enough for the special components to be built from. Not competing with shadcn on count.
- **The core is components that transform**: MorphHeader, ExpandableCard, and in the same spirit a Dialog born from its trigger, Popover/Dropdown growing from its trigger, Tabs with a sliding indicator, a Toast that expands on hover, a Search that grows from an icon.
- **Out of scope**: data tables, charts, complex calendars.

## Stack

- **Vue 3** + TypeScript
- **Tailwind v4**: tokens are defined as CSS variables with `@theme`
- **motion-v** for animations (declarative, `layout` / `layoutId` for morphs)
- **Lucide** for the few icons the library's own parts need (a cross, a check, chevrons…), as most projects use it for theirs; named by meaning in `icons/internal.ts`

## Distribution

- **Option B**: the library ships no compiled CSS. Each project runs Tailwind and scans the components with `@source`.

## Tokens

- Starting point: the tokens in `Portfolio/src/index.css` (colors, spacing, radius, typography, motion).
- Light and dark themes: every color is `light-dark(light, dark)`, so the theme is just `color-scheme`. It follows the system and `data-theme="light" | "dark"` on `<html>` forces one.
- Component tokens are never declared by the library; components read them with a fallback (`var(--card-radius, var(--radius-xl))`), so setting one anywhere (`:root`, a wrapper, an instance) works.

### Three customization levels (most specific wins)

1. **Global** (whole project): `:root { --color-accent: …; --radius-md: …; }`
2. **Per component** (every Card, every Button): each component reads its own variables (`--card-radius`, `--card-border`, `--button-bg`…), which default to the global ones.
3. **Per instance** (a single use): `class="…"` or `:style="{ '--card-border': '#2e9bf7' }"`.

## How a component adapts (4 layers)

1. **Tokens**: global changes across a project.
2. **Variants** (cva): `variant`, `size`…
3. **`class`** (tailwind-merge): one-off tweaks on a single use.
4. **Composition** (slots): change the structure (`Card`, `CardHeader`, `CardTitle`…).

## API style

- **Composition first**: small parts with slots.
- **Few convenience props**, only for the 90% case (`label`, `icon`…).
- **Props / `v-if` for configuration** (variant, size, open) and **slots for content**.
- Parts coordinate through **provide/inject**, never by manually passing props from parent to child.
- The component provides the behavior (animation, state, keyboard); the project provides the content.

## Clean code

- One folder per component, each part in its own `.vue` file:
  ```
  components/card/
    Card.vue
    CardHeader.vue
    CardTitle.vue
    card.variants.ts   ← cva
    card.context.ts    ← typed provide/inject
    index.ts           ← public exports
  ```
- `<script setup lang="ts">` with typed props via `defineProps<…>()`.
- No hardcoded colors or sizes: always tokens.
- Small, single-responsibility components. When one grows, split it into parts.
- Clear, consistent naming: `Component` + `Part` (`CardTitle`, `MorphHeaderNav`).
- Comments only to explain the *why* of something non-obvious.
- Everything in English: code, comments, docs and commits.

## Two component tiers

- **Base**: Button, Input, Card and its parts… Simple and reusable.
- **Special**: `MorphHeader`, `ExpandableCard`… Built on top of the base tier, with more personality. Reference: the Header and project Card from the Portfolio (React), ported to Vue.

## Accessibility

- **Reka UI** (headless) for components with complex behavior: Dialog, Dropdown, Select, Tooltip… It handles focus, keyboard and ARIA; elastic-ui adds the styling on top.

## Docs / playground

- **Storybook** to browse and test every component in isolation.

## To be decided

- Concrete variants and sizes for each component.
