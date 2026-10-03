# Design decisions — elastic-ui

A Vue component library for my own projects, built to adapt to very different use cases.

## Philosophy

**Clean interfaces where things transform instead of appearing.**

1. **Continuity: nothing appears or disappears without a transition.** The interface behaves like a physical space: everything comes from somewhere and goes somewhere, so the eye can follow it. The card grows out of its cell, the header stretches into a panel, the tab indicator travels to the new tab. A click never swaps the whole screen at once.
2. **Transform, not spectacle.** Shape and position change with the one emphasized ease, and nothing more: no stretching text, no bouncing. A liquid join (gooey) is welcome where it tells something, two shapes that belong together meeting or parting, as ChatComposer's send button pulling out of the pill like a drop. Motion is there to explain what happened, not to show off.
3. **Fewer boxes.** Order comes from space, typography and color first. Borders and backgrounds only where they add something, such as an interactive surface or real grouping. A box can appear when it is needed (on hover, when open) rather than sit there at rest.
4. **Accessible by default.** Keyboard, Escape, focus and `prefers-reduced-motion`.
5. **Objects that transform in place.** The parts with the most character are small objects rather than widgets, a bin with its lid, a folder with its pages, a file with its folded corner, drawn with a light touch of skeuomorphism: a shape you recognise, a few parts that move as parts (the lid tips open, the pages fan out, an icon travels to its row), and nothing realistic beyond that. They change in their own place instead of opening something over the page: a delete asks in its own square, a bar grows into its list over its own card. At rest they are flat and quiet; what lifts or opens takes on material (a soft shadow, a line of light along its top), and colour only appears where it means something (the danger of a delete, the tint of a kind of file). Everything else here, the morph of a real size, `blur-in`, TextMorph, "leaving comes before making room", is how these objects move. Ideas are tried in `src/lab` first (Storybook's Lab) and only then made parts; see the Lab in `ROADMAP.md`.

### How objects are drawn

Learnt from redoing the lab's pieces against their references (Rare UI's delete and activity card):

- **Depth from tones, not shadows.** A surface a tone lighter or deeper than the one it sits on gives it volume; what floats over the page (a popover, a menu, a dialog, a toast) stands on the raised surface with a hairline round it, and under it only a shadow so faint it is barely there (`shadow-overlay`, `shadow-soft`), so it still reads as on top over a photo or dense text.
- **Fields are trays.** A place to write sits a tone off what holds it (a tone deeper inside a Card), with no line at rest; a soft line comes on hover; on focus the tray lifts to the raised tone (no dark line, no halo); invalid, the line turns red. A field that grows into a panel (Select, Combobox) stays a tray as it opens, its highlighted option a tone above.
- **Split a shape rather than nest one in another.** When a part opens into more, it divides into halves of different tone joined along a curve (the delete's answers running to the pill's own edge, with a tail pointing at the bin); a box inside a box reads as two things.
- **Simplify an object down to its gesture.** A bin without stripes, so its lid reads as it tips open. Fewer details, larger movements of its parts.
- **Nothing that moves crosses visible text.** Words come into focus only once the pieces travelling past them have gone by.
- **No outlines round things that overlap.** Icons stacked on one another just overlap; a ring in the ground's colour round each reads as a cut-out sticker.
- **Light has two sources.** The Aurora is the library's light for AI: its own colours, following the work. The Glow is the same light in the colour of the content itself: the Aurora, its colours taken from an image, behind what shows it (a project, a track). Neither is decoration laid on a page for its own sake.
- **Over colour, glass.** What sits over an Aurora, a Glow or a photo is glass (`glass`, `glass-strong` over a photo), never a solid panel cut into the colour and never a dark fill over a light: the colour comes through, blurred, and the text reads on it.
- **Compare with the reference before calling it done**: close-up screenshots of both, side by side, at the same states.

### Type

After Vercel's Geist, Refactoring UI and Linear's and Stripe's restraint.

- **Five sizes, no others.** `text-display` (28, a page's one title), `text-title` (20, a panel's or section's), `text-copy` (16, text to read), `text-label` and `text-ui` (14, a line to act on or scan, and plain interface text), `text-meta` (12, dates, counts, hints). Each carries its line height, tracking and weight. No `text-[13px]`: a size between two of them is one of them.
- **Three weights, each with a job.** 400 to read, 500 to act or scan, 600 to announce. Never bold, and weight never says how important something is.
- **Importance, in this order: colour, space, size, weight.** `fg` for what matters, `fg-secondary` for what goes with it, `fg-muted` for what is beside the point. A secondary line is greyer, not smaller or thinner.
- **One thing leads.** A screen has one line that catches the eye first; at most three sizes are in view at once.
- **Tighter as it grows.** Tracking closes from `copy` up; at 14 and below it stays as the font draws it.
- **No decorative capitals.** Section labels in sentence case (`text-label`, muted), not small spaced capitals.
- **Glyphs are not text.** A letter in a round mark, an emoji face, a file icon's label are drawn at the size their shape needs, outside the scale.
- **Figures line up.** `text-meta` and anything in columns uses tabular figures (`tabular-nums`).

### Taking an idea from elsewhere

A part seen elsewhere (Rare UI, Family, Apple's apps, a post) becomes the library's own in five steps, never by copying its code:

1. **Look closely**: screenshots of the reference at twice or three times the size, and frame by frame through what it does.
2. **Name what makes it work** in terms of the library's identity (Philosophy 5, "How objects are drawn"): which of its traits fit, and which break a rule (a bounce, a heavy shadow, a gooey join) and are left out.
3. **Redo it in the lab** (`src/lab`) with the library's own building blocks: its tones, its morph, its way of moving things to their place.
4. **Compare side by side** with the reference, at the same states, before showing it.
5. **Make it a part**: its stories and Situations, a look in light, dark and on a phone, a line in ROADMAP's table, and a credit to the idea in its doc comment.

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
  6. What scrolls inside keeps its scrollbar's room from the start (`scrollbar-gutter: stable`): scrolling is only turned on once the box has landed, and a scrollbar appearing then would narrow the content by its width, a last little jump.
  Scaling a shared box (`layoutId`) is only for one that grows a little and in proportion, as DialogMorph's into a small dialog: grown much, or into a tall panel, it reads as a zoom rather than a change of shape.
- **Morph or liquid: count the objects.** One thing that changes its shape is a morph, of a real size: a button becoming its panel, a card its page, a field its list, a bin its question. One thing splitting into several, or several joining into one, is liquid (`Liquid`: shapes blurred together and cut back, so they meet by a neck and part as drops): the send button pulling out of the composer's pill, "Share" letting go of its actions, a carousel's dot flowing to the next. Liquid is for small, rounded shapes that read as drops (pills, circles, dots), never for boxes full of content. The two never play on the same piece at once; one can follow the other (the drops come out, then one opens into its panel).
- **Leaving comes before making room.** An item that goes (a tag, a file, a list item) fades where it stands, keeping its room, so nothing is squeezed while it goes; then its room closes and the rest move. Along one line they slide over; if any would cross another (a change of line, a reorder, cards reflowing), all that move fade where they were and come into focus where they land, as a wave (AnimatedList, TagsInput, FileUpload).
- **One way to appear: a fade.** Content that shows up fades in once the shape has nearly arrived, and fades out before it leaves. No wipes, slides or typewriters on top of a morph; that is too much motion. Content being read comes into focus rather than switching on (`blur-in`: opacity and a 2px blur, as in Magic UI's Blur Fade, without its offset). Several blocks do it as one flowing wave: 0.45s each, only 40ms apart so the fades overlap instead of reading as steps, capped at the eighth (`stagger-children`); they leave all at once.
  - The one typewriter is the Sidebar's labels, taken from SkillNet: folding, their letters are erased from the end, and unfolding they are written back from the start, a touch later down each row. Only there, where a label shrinks to nothing and grows back along its own line; a label too long for its row still ends in a fading edge.
- **Appearing is not becoming.** Content that was not there comes in with `blur-in` (and as a wave when there is more than one block). Text that was there and takes a new value, a label, a status or a count, turns into it with `TextMorph`: its shared letters travel to their new places. Only short text morphs; a paragraph that changes is simply replaced.
- **Open from the true origin, and let it be taken back halfway.** A box grows out of what was pressed, the very object looked at (the card, the button, the field), never from a spot chosen for convenience; and a morph can be reversed while it plays: pressed again or Escape mid-way, it turns back from where it is rather than finishing first (after the Dynamic Island, as Rauno Freiberg describes it).
- **What is used all the time does not morph.** A menu opened many times a minute, a tooltip, a context menu: it appears at once and goes at once, with only the choice acknowledged (it blinks once as it is picked). The morph is kept for what happens now and then, where following the movement helps; on what is repeated, it only gets in the way.
- **One thing leads.** On a screen, one movement draws the eye. When a morph is the main one (the MorphHeader growing into its panel, a card lifting), what changes around it, such as an icon or a label, changes quietly instead of animating on its own and competing with it: MorphHeader's menu icon switches to its close without IconMorph.
- **Loading is not a stand-in.** No skeletons, no grey shapes pretending to be content. While something loads, a StatusText says so with its shimmer; when it arrives, it comes in as everything does, into focus as a wave (`blur-in`, `stagger-children`, the chat's streaming), and the box around it eases to its new height so nothing below it jumps. (A skeleton whose shapes stretched into the content was tried and left out.)
- **What is open when the page loads just shows.** Entrances play for a change the user makes, not for the first render: an Accordion or a NavTree group open from the start is simply there (`useHasChanged`).
- **Truncate with a fading edge, not an ellipsis**, in anything that morphs. An ellipsis is on or off and cannot be animated; a `mask-image` edge can. When the line gets room, the visible part stays still and the edge plus the hidden rest fade in with the same timing as everything else (`ExpandableCardText`). Only a line that runs past fades: one that fits keeps every letter (`TruncatedText`).
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
- **The dashboard is in scope.** Data tables, charts and the dense, data-heavy pages a real project asks for are welcome: the library grows towards them (`ROADMAP.md`, "Next").

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

### Names

The same thing has the same name in every part:

- **`v-model`** holds the part's value; anything else it lets you bind has its own name: `v-model:open` for whether it is out (never `isOpen` or `expanded`), `v-model:page`, `v-model:step`, `v-model:state`.
- **Phases** of work, where a part lets you bind or set them, are `idle`, `working`, `done`, `error` (ProgressButton, ChatTool, StatusText's `working`); never `running`, `loading` or `failed`. Button's `loading` stays: it is Button's own word for a press that waits.
- **`variant`** is a part's look (`solid`, `ghost`, `soft`, `vivid`); **`tone`** is a colour with a meaning (`danger`, `warning`, `neutral`, `accent`). A part with both keeps them apart.
- **`size`** is `sm`, `md`, `lg`, with `md` the default; Button adds `icon`.
- **Texts the part writes** end in `Label` and default to `labelFor(...)`: `closeLabel`, `doneLabel`, `errorLabel` (never `failedLabel`).
- **Booleans** are adjectives that are off by default: `compact`, `bare`, `floating`, `interactive`, `numeric`.
- **Events** are what happened, in the present: `confirm`, `select`, `remove`, `send`; a part that only reports an outcome says it in the past (`copied`, `changed`).

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

## Known pitfalls and their standard fixes

Things that went wrong once, found by measuring frame by frame, and the fix every part uses since. Check a new part against them.

- **A letter trembles at the end of a TextMorph.** Torph sets each letter in a box of its own, which has no kerning, and TextMorph hands the words back to plain text once the morph is over; with kerning on, that hand-back shifted a letter by a fraction of a pixel. TextMorph keeps kerning (and ligatures) off at rest as while it morphs. Never turn them back on round a TextMorph.
- **A box jumps a few pixels as it lands.** Scrolling is only turned on once a box that became a panel has landed; a scrollbar appearing then narrowed the content by its width. What scrolls inside keeps its scrollbar's room from the start (`scrollbar-gutter: stable`; useMorphBox's recipe, step 6). Headless Chromium hides scrollbars by default: check with them on (`ignoreDefaultArgs: ['--hide-scrollbars']`).
- **A travelling image lands a pixel off, or reshapes as it lands.** Measure every box with `getBoundingClientRect` (never `offsetTop`/`offsetWidth`, which round to whole pixels), and give the traveller the radius of what it becomes from the start, read from the tokens rather than assumed.
- **A box grown from a small one reads as a zoom.** Growing by scaling a shared box (`layoutId`) stretches it: a box that becomes a panel changes its real size (`useMorphBox`).
- **Something measured from its content comes out too tall.** Measure a height only once the content has its final width (a sheet's height from its wrapped text).
- **A drag stops following the pointer.** The pointer is captured by the element pressed; if that element is re-rendered (a TextMorph inside a slider's thumb), the capture is lost. Children of what captures the pointer take `pointer-events: none`.
- **A class does not win.** Two Tailwind classes for the same property (`bg-*` and `bg-*`) are decided by their order in the stylesheet, not in the attribute: compute one or the other, or merge with `cn`, never list both.
- **A box folds back a few pixels off, then jumps.** A dialog's scroll lock (Reka UI's) takes the page's scrollbar away, so the page under a box that grows over it shifts while it is out. Where the page stays in view (ImageView), lock scrolling on `<html>` with `scrollbar-gutter: stable`, so it keeps the scrollbar's room.
- **A morph jumps at its start and goes on from halfway.** Work done on the click (decoding a large image, drawing it to a canvas, a heavy layout) lands on the morph's first frames and the browser drops them. Headless screenshots may not show it; a slower machine does. Do that work beforehand, while the browser is idle (`requestIdleCallback`), as ImageView decodes its picture and reads its corner, so the click only starts the morph.
- **Progress moves in jerks.** A tween restarted on every update eases to a stop before the next one arrives. Something that follows a value updated often (a fill, a count) follows it on a spring damped past critical (`useSpring`), which keeps its speed from one update to the next and never overshoots; what it tells at the end waits for it to get there (Progress).
- **The page jumps when a part mounts.** `scrollIntoView` scrolls every container up to the page to bring its element in view, so a part keeping something in view inside itself (a tab in a scrolling row) moved the page too. Scroll only the part's own container (`el.scrollTo`), never `scrollIntoView`, unless the page itself is meant to move (TableOfContents, a card opening).
- **A toast shows several times.** Every `<Toaster>` reads the app's queue, so a page holding several (examples side by side) shows each toast in all of them. An app has one Toaster; anywhere with more, each takes its own queue (`createToastStore()` as its `store`).
- **A size from the type scale vanishes.** `tailwind-merge` takes an unknown `text-*` for a colour, so `cn('text-title text-fg')` kept only `text-fg`. `cn` knows the scale's names; a new size goes into its list too.
- **Clicks do nothing on a card over a popover.** A popover kept mounted but hidden (to fold back into) still has its layer above the page: what opens over it sits higher (Term's card).
- **A marker lands off inside a panel that grows in.** A Popover grows from 97%, so boxes measured on screen while it does are scaled, and an indicator placed from them (NavTree's) stays off once the panel is full size. Divide what is measured by the container's scale: its box on screen over its laid-out width (`getBoundingClientRect().width / offsetWidth`).
- **A line that fits loses its last letters.** `mask-fade-r` fades the end of its box whether the text runs past or not, so a label put in it by habit lost its last letters, in this library and in the projects using it. A line that may fit is a `TruncatedText` (or, on an element a part already owns, `useTruncated`), which fades only while it runs past; the bare class is for content that always overflows.
- **A new story renders unstyled in Storybook.** The dev server misses Tailwind classes in new files: `touch .storybook/preview.css`.

## Two component tiers

- **Base**: Button, Input, Card and its parts… Simple and reusable.
- **Special**: `MorphHeader`, `ExpandableCard`… Built on top of the base tier, with more personality. Reference: the Header and project Card from the Portfolio (React), ported to Vue.

## Accessibility

- **Reka UI** (headless) for components with complex behavior: Dialog, Dropdown, Select, Tooltip… It handles focus, keyboard and ARIA; elastic-ui adds the styling on top.

## Docs / playground

- **Storybook** to browse and test every component in isolation.

## To be decided

- Concrete variants and sizes for each component.
