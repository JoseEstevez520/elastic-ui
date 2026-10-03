# Using elastic-ui

Rules for building with the library, for people and for coding agents alike. How the library itself is made lives in `DECISIONS.md`; this is how to use it well in a project.

## What is the library's, and what is the page's

If you would use it unchanged in another project, it belongs to the library; if it says something about a subject, it belongs to the page.

- **The library** is how things look and behave: the parts, the engines without their content (AgentReplay plays any session, TerminalReplay any terminal), the visual language (tokens, tints, the diagram classes, `Diagram`), the generic layout (`article`, `side-by-side`, SidebarLayoutHeader), the behaviours (when something starts, when the scroll line shows) and these rules.
- **The page** is what is said: its text and order, each concrete diagram (drawn with the library's classes), each session's script, its data (a timetable, a navigation tree, the colours of its sections) and what only that site needs.
- **Storybook's examples** carry content only to show the parts working; how to explain a subject is decided in the project, not there.
- A drawing or a session that ends up repeated in two projects can move into the library as a part of its own; while it lives in one, it stays with the page.

## 1. Morph by default

Where there is a morphing version, use it. The library's personality is things turning into other things, and a plain panel appearing from nowhere is the exception, not the rule.

| For | Use | Fall back to the plain one when |
|---|---|---|
| A panel from a button | `PopoverMorph` | the trigger moves (in a scrolling list, a table row), or sits in a box that clips what overflows it |
| A short menu | `PopoverMorph role="menu"` + `PopoverMorphItem` | it has submenus or scrolls: `Menu` |
| A dialog | `DialogMorph` | there is no button to grow from (opened by the app, a route, a shortcut) |
| Picking one value | `Select`, or `Combobox` to type and filter | — |
| Picking a place in a tree (a section, a folder) | `NavTree selectable` in a `PopoverMorph`, closed on `@select` | — |
| Picking a date | `DatePicker`, or `Calendar` when the month is the page's content | — |
| An action that takes a moment (send, save, publish) | `ActionButton`: it gathers round while it works and widens into what happened | the amount done is known: `ProgressButton`, which fills |
| An action that cannot be undone (delete, reset) | `ConfirmButton`: it asks in its own place, in the danger colour | it can be undone: `tone="warning"` with `ArchiveIcon` for an archive, `tone="neutral"` for a sign-out |
| Two to four quick actions, each clear from its icon (share to…, react) | `SplitActions`: they pull out of the button as drops (`row`, `fan`), or it grows into a ring or a split column round them (`ring`, `column`) | they need words: `PopoverMorph role="menu"` |
| Cards that open | `ExpandableCard` in an `ExpandableCardGroup` | the content is a page of its own: link to it |

Fields that open (Select, Combobox, DatePicker) grow out of themselves: their outline stretches down to hold the list or the month, and folds back once something is picked. Give them their width on the part itself (`<Select class="w-56">`), since it draws the outline; in a `Field` they fill it.

In a row of quiet actions (a tree, a list's rows, a page's top bar), the triggers go ghost so nothing stands out at rest: `Button variant="ghost" size="icon"`, `DialogMorph variant="ghost" size="icon"`, `PopoverMorph variant="ghost"` (`size="sm"` beside small Buttons, `size="icon"` for an icon alone) and `ConfirmButton variant="ghost"` look alike until one is pressed.

A PopoverMorph near a screen's edge keeps the screen's margin: its box moves sideways as it grows, and it opens upwards when there is no room below. `align` and `side` say where it goes when there is room. On a phone, give a panel that holds a list or a tree `fluid`, on `PopoverMorph` or `PopoverContent`: it fills the width less the margin, rather than floating beside a strip of page. Wider screens keep `--popover-width`.

A tree to pick from is a `NavTree` with `selectable`: its items, and its groups with a `value`, are options rather than links, and every pick emits `select`, the moment to close the panel.

```vue
<PopoverMorph variant="ghost" size="sm" align="end" fluid label="Where it goes">
  <template #trigger><Folder aria-hidden="true" />{{ placeName }}</template>
  <template #default="{ close }">
    <NavTree v-model="place" selectable label="Where it goes" @select="close">
      <NavTreeItem value="unsure">Not sure</NavTreeItem>
      <NavTreeGroup label="Web client" value="web-client">
        <NavTreeItem value="unit-1">Unit 1 · HTML</NavTreeItem>
      </NavTreeGroup>
    </NavTree>
  </template>
</PopoverMorph>
```

```vue
<PopoverMorph role="menu" label="Actions">
  <template #trigger>Actions</template>
  <PopoverMorphItem :icon="Pencil">Rename</PopoverMorphItem>
  <PopoverMorphItem :icon="Trash2">Delete</PopoverMorphItem>
</PopoverMorph>
```

## 2. One thing leads

On a screen, one movement draws the eye. When a morph is the main one, everything around it changes quietly.

- Don't animate an icon, a label or a badge on its own next to a morph that is already moving.
- Don't open two morphs at once, and don't start one while another is still landing.
- Prefer the library's ready-made animated pieces (ThemeToggle, CopyButton, BadgeCount) to animating details yourself.

## 3. Appearing, or becoming

Two different moments, two different movements:

| Moment | Use | For example |
|---|---|---|
| **Something appears**: content that was not there | `blur-in` and the wave, built into the parts | a group's items as it opens, a dialog's body, a menu's options, a list loading, a toast arriving |
| **Something becomes something else**: the same place, a new value | `TextMorph` | "Save" → "Saving…" → "Saved", "Follow" → "Following", "Pending" → "In review", 3 → 4 unread, "All (24)" → "All (8)", "Due in 3 days" → "Due in 2 days" |

The short rule: if the user just caused the change, or it is a value they follow, it morphs; if it is new content, it comes into focus.

Neither, just replace it:

- Long text or paragraphs that change: morphing them is dizzying.
- Text on something already transforming (a button turning into a dialog): one thing leads.
- Values that change all the time (a live feed, a clock's seconds): a morph on every tick is noise.

```vue
<Button :icon="saved ? Check : Save" @click="save">
  <TextMorph :text="saved ? 'Saved' : 'Save'" />
</Button>
```

## 4. Icons where they help, not everywhere

An icon earns its place when it helps find something at a glance: buttons, menu items, inputs, and the first level of a navigation. Past that it is noise: an icon or a coloured dot on every row, a badge on every card tire more than they tell.

- In a NavTree, give icons to the top-level items and groups only; subgroups and pages are text. A folded Sidebar still needs its top level's icons for its rail.
- No decorative marks (dots, badges) where they don't say something the text doesn't.
- **Lucide** (`@lucide/vue`) for general icons, **Simple Icons** (`simple-icons`) for brand and technology logos, in their own colour.
- A logo is drawn with `Logo`, given the Simple Icons entry itself (`:icon="siVuedotjs"`): the library ships no icons, so the project picks the ones it uses. A stack is a `LogoList` of `LogoListItem`s, each its logo and its name.
- Over colour (a Glow, a photo) a `LogoList` goes `bare`: a tray under each name would cut holes in it.
- Links that each have a recognisable icon (GitHub, LinkedIn, an email, a project's site and its code) are an `IconLinks` row: the icon alone at rest, opening into its label when pointed at. `ghost` drops the trays, for a row over colour or beside text. A link given `copy` copies an address instead of going anywhere.
- Pass the component, not a rendered icon: `:icon="Search"`.
- An icon alone needs a name: `aria-label` on its button, `label` on the part.

```vue
<Input :icon="Search" placeholder="Search" aria-label="Search" />
<Button variant="ghost" size="icon" aria-label="Settings"><Settings /></Button>
```

## 5. Customize from the outside in

1. **Tokens** for the whole project: `:root { --color-accent: …; --radius-md: …; }`.
2. **Component tokens** for every instance of one part: `--card-radius`, `--popover-bg`, `--sidebar-bg`…
3. **Variants and props**: `variant`, `size`, `align`…
4. **`class`** for one use, last.

Never hardcode a colour, a duration or a curve. Motion comes from the library's eases (`--ease-emphasized`, `--ease-soft`, `--ease-glide`), and a component's timing is part of its design: change the component, not one use of it.

## 6. Text that fits the motion

- Keep labels short; the library is built for another language making them longer, but not for paragraphs in a button.
- A line that doesn't fit ends in a fading edge, never an ellipsis, and a line that fits keeps every letter. Put such a line in `TruncatedText`: it fades only when its content runs past, and measures itself as it resizes or changes, row by row in a list. For one element you already own and can't wrap, `useTruncated` tells you when to add the edge. The bare `mask-fade-r` class always fades the end, so keep it for content that always overflows (an edge of something that scrolls). Text that grows into more room is `ExpandableCardText`.
- Inside anything that morphs, don't let a height depend on the width: keep such text to one line.

## 7. Accessible as you use it

- Every `DialogMorph` has a `DialogMorphTitle`.
- An icon-only `DialogMorph` (`size="icon"`) or `ConfirmButton` gets its name: an sr-only label in the trigger, or `label`.
- A field without a visible label gets an `aria-label`; one that needs fixing gets `invalid` and a message linked with `aria-describedby`.
- `NavTree` is bound to the current route with `v-model`, so the active item carries `aria-current`. A tree to pick from takes `selectable` instead of buttons dressed as links: it is announced as a tree, the chosen row selected, and moved through with the arrow keys.
- Don't take focus away from where the library puts it: into a panel as it opens, back to its trigger as it closes.

## 8. Colour: grey by default, the aurora for AI

The interface is grey. Colour means something, and there are only three kinds:

- **Outcomes**: success, warning, danger, for what went well, what needs care, what went wrong. Nothing else takes those colours.
- **The accent**, for what you can act on or where you are. A project may set it to a neutral grey; the parts still work.
- **The aurora**, the one decorative colour, and only behind AI at work: ChatMorph, AgentReplay, an Aurora behind a chat.

Around the aurora:

- **One per screen**, and never as page decoration: it says "AI works here".
- **Its colours are its own**, not the accent's, so a grey accent does not turn it grey. Change them with `--aurora-1` to `--aurora-4`, all four together, keeping them light and apart in hue.
- **Nothing on top of it but the library's glass.** No gradient, image or fill of your own behind the composer, the bubbles or the steps, and no dark fill over it: they read as holes in the colour. The glass comes with the parts (`chatGlassStyle`).
- **Text over it in `fg` and `fg-secondary` only**, never `fg-faint`, which is for placeholders. If a colour you chose makes text hard to read, it is the colour that changes, not the text.
- **No shadows of your own**, and no glass inside glass.

## 9. Explaining with AI parts

- **A session, not a picture.** To show how an agent works, play one back (AgentReplay) with a note for each moment, rather than drawing boxes and arrows.
- **Compare inside one figure, or one after the other**, never through a selector and never as two big interactive parts side by side, which compete for the eye: each session under its own heading. With several on screen, one plays at a time.
- **Real-looking, and said to be an example.** Sessions are scripted: keep them plausible (real file names, real commands, real output) and say they are made up.
- **Code that changes, shown changing**: CodeWalkthrough to build it step by step, CodeDiff for one edit. A CodeBlock alone for code that simply is.
- **Short notes.** A note says what to notice now, in a sentence or two; the explanation around the part carries the rest.
- **It starts where it is looked at.** What plays on its own starts once it is in full view, and a moment after, not while it only peeks in at an edge; the library's parts already do.
- **Every part to watch or play with ends in its conclusion, where it can be seen**: a session's last note stands out once it has played, and the text right after it says the conclusion again in bold. Whoever only glances at the end still leaves with the idea.
- **The text around it frames it, and does not retell it**: a sentence before says what to watch for, a sentence after says what it showed.

## 10. Diagrams

Draw each idea for what it is, as a small SVG made for it, rather than feeding it to a generic diagram: a chart of how two things grow, a row of steps, the parts of a request. What makes them read at a glance:

- **Tints, not outlines.** A part is a soft tint of its colour (`color-mix(in oklab, <colour> 14%, var(--color-bg))`) with no border, corners at `--radius-md`, its label in that colour mixed with the text colour, as Timetable's blocks. Lines are only for what connects or measures.
- **Weight says what matters.** Axes and connections at 1px in `--color-border-strong`, a grid dashed and fainter (`--color-border`), and one thing, the point of the diagram, at 2.5–3px in the accent. Everything else steps back: muted, dashed or lighter. One thing leads here too.
- **Labels on the drawing**, beside what they name, at the end of a line or inside a tint; no legend to look up.
- **One colour per concept, the same on every page** that shows it (the model always one colour, the harness always another), and colour only where it means something.
- **Icons thin and small** (Lucide, 16–20px, stroke 1.5) with a short label; a process as icons joined by a plain arrow.
- **Still, unless touched.** It comes in once, as a group, when it enters the view, and then only moves when someone acts on it. A toy (something to drag, a switch) only when touching it is the point, and one per diagram.
- **Readable at its size:** drawn in a `viewBox` that scales with the column, text never below 12px on screen; where a horizontal drawing crowds a phone, a vertical version of it.
- **Said in words too:** `role="img"` with an `aria-label` that tells what it shows, or a `figure` with its caption.

Most ideas are pieces that fit together or a flow, and are composed rather than drawn: in a `Diagram`, a `DiagramGroup` lays out `DiagramArea`s (a concept holding others), `DiagramChip`s (a part) and `DiagramArrow`s in a row, a column or a grid. A row runs down on its own when it no longer fits, and its arrows turn with it; keep areas one level deep, never an area in an area. Data on axes, real values measured or compared, is a `Chart` (below). What neither can make (a curve that only shows a shape, a timeline) is an SVG with the classes above.

```vue
<Diagram label="A request goes from the browser to the controller, which answers with JSON">
  <DiagramGroup>
    <DiagramChip :icon="Globe" color="#2563eb">Browser</DiagramChip>
    <DiagramArrow label="GET" />
    <DiagramArea title="Controller" color="#7c3aed" note="Finds the method for that route.">
      <DiagramChip>@GetMapping("/products")</DiagramChip>
    </DiagramArea>
  </DiagramGroup>
</Diagram>
```

### Charts

`Chart` draws values on real axes: a `line` for something that changes along x, `bars` to compare categories, `points` for two measures of the same things (a model's cost against its score). The data goes in as props, `series` of `{ x, y, label? }`, and each axis takes a `title`, a `unit` and a `scale` (`log` when the values span several orders of magnitude).

- **Grey until colour means something.** One series stays grey and the chart's `label` names it. Several take the palette's four hues in order, always in that order, with a legend; past four they turn grey, so fold the rest into one or draw two charts. A series that is the same concept on every page can carry its own `color`.
- **Name only the points the text talks about.** A `label` on a point is written by it when it fits and left to the tooltip when it would collide. A name on every point is noise.
- **One y axis.** Two measures with different units are two charts.
- **Say what it shows** in `label`, as a sentence with the conclusion: it is the name screen readers hear, and the caption of the table they get.

```vue
<Chart
  variant="points"
  :series="[{ name: 'Models', points: [{ x: 0.4, y: 52, label: 'Flash' }, { x: 9, y: 78, label: 'Large' }] }]"
  :x="{ title: 'Cost per million tokens', unit: 'USD', scale: 'log' }"
  :y="{ title: 'Score', unit: '%' }"
  label="Score against cost: it rises with cost, then flattens past ten dollars"
/>
```

**Written elsewhere** (by a model, by a student), a drawing or a piece is shown so it can do no harm: an SVG with `DiagramImage`, as an image that runs nothing; interactive HTML with `SandboxFrame`, in a frame with no way to the page or the network, as tall as what it holds. Both take the theme's tokens and follow its changes. Never put such markup in the page itself (`v-html`).

A piece in a `SandboxFrame` can be plain HTML or be made of the library's own parts:

- **Plain HTML** (`html`) for what needs no parts: a canvas, a drawing that moves, a few native fields. Plain buttons and fields already take the library's look, and it loads nothing.
- **Library parts** (`piece`) when the piece is controls and figures that should look like the page's: a `Button` that counts, a `Slider` driving a value, `DiagramChip`s that appear, a `Chart`. The piece is a Vue single-file component with a `<template>` and a plain `<script>`, and the parts are used by name, with nothing to register:

```vue
<template>
  <Button @click="count++">Ask for one</Button>
  <DiagramChip v-for="n in count" :key="n">Instance #{{ n }}</DiagramChip>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    return { count }
  },
}
</script>
```

It runs on the sandbox runtime, `dist/sandbox-runtime.js` in the package (about 220 KB gzipped: Vue with its template compiler, the parts and their CSS). The host serves that file and passes its address as `runtime`; with Vite, `import sandboxRuntime from '@joseestevez/vue-elastic-ui/sandbox-runtime.js?url'`, or copy it to `public/`. Only pages with such a piece load it, once for all of them. Rules for the piece: `<script setup>` does not work (there is no compiler for it in the frame), imports come only from `vue` and `@joseestevez/vue-elastic-ui`, and its own classes are limited to a small set of layout utilities (`flex`, `grid`, `gap-*`, `p-*`, the type sizes and colours). Its parts are the controls, the figures, the diagram's and the chart; navigation, overlays and chat are left out. The frame stays as closed as with plain HTML: it may load that one file and nothing else. It also allows `eval`, which Vue's compiler needs; inline code could already run anything, so the piece gains nothing by it.

## 11. Composing a page

Not a template to fill: a page is composed from what it has to say. What the best explaining pages share (Nielsen Norman's eye-tracking, Every Layout's primitives, Distill's and Tufte's figures tied to their text):

- **A figure sits by the text it explains**, right after the paragraph that calls for it; never in a region of its own further down the page. Reading and looking are one movement.
- **Aligned by default.** Text and figures in one column read and scan best. Putting figures on alternating sides slows scanning; keep it for the odd moment, and only with figures that carry information, never with decoration.
- **One width for everything.** Text, figures, code and tables share the same two edges, so there is always one line to lean on; `class="prose article"` holds an article to it. A few widths on one page read as disorder. What does not fit that width, such as a whole week's timetable or a wide diagram, gets a version of its own for it (a day at a time, a diagram drawn upright), rather than spilling past the edges. Notes go in the text, as a Callout, not in a margin.
- **No empty room.** Space separates ideas; it is never a hole left by a layout. A small figure is not put in a big column: it goes with its text. If two things side by side leave one short and one long, they go one after the other.
- **Side by side only when both fit and both matter at once**, as a term and its figure, or two short files; `side-by-side` stacks them on its own when there is no room, measured from the content, not from a fixed breakpoint.
- **One thing to play with per screen.** Two interactive parts next to each other split the attention.
- **A process told in steps can hold its figure** in view while the steps scroll beside it (CodeWalkthrough), when the figure changes with the steps; a figure that does not change goes with its text instead.
- **Say it, then show it.** A new idea opens with a sentence that defines it, then the figure that makes it concrete, then the detail.
- **Rhythm:** more space between ideas than inside one, so each reads as a unit without a box; after something dense, something light.
- **On a phone** it is the same column, narrower: each figure after the text that calls for it.

## 12. Going deeper without leaving the page

- **Detail opens where it is.** A term, a case, an example the reader may want: an ExpandableCard, a Collapsible, a PopoverMorph or a DialogMorph grows out of it and folds back. The reader keeps their place.
- **A new page is for a new topic**, not for more of the same one.
- **Where an idea comes from** (a book, a talk, a project) is a `Card` with `href`: the whole card is the link, with an optional `CardImage`, its `CardTitle` and a `CardDescription` line. To another site it opens in a new tab, its title carrying the outward arrow.
- **Between pages, only the content changes.** The Sidebar, the header and the search stay still; the sidebar's tab slides to the new page and the breadcrumbs morph their words. It happens at every click, so it stays light: the old content fades, the scroll goes back to the top, the new fades in, about a third of a second in all. No wave, no blur, no slides from the side. `PageTransition` round the RouterView's page does all of it.

## 13. Scrolling

- **The page scrolls, not a box inside it**, unless the box is a surface of its own (a chat, a panel). Sticky parts and TableOfContents expect the window.
- **A scrollbar is a short line** (ScrollIndicator): hidden at rest, it shows for a moment when the page opens and while you scroll. Put one in the page's layout; ChatThread brings its own.
- **Inside a box, text fades at the edges it scrolls under** and the line runs only where the text reads (`inset`), never along the box's corners.

## 14. Writing notes and guides

- **Write Markdown and render it with `Markdown`**: it gives the article its type (Prose) and turns what you write into the parts. No hand-made HTML for code, alerts or tables.
- Code in fences with its file: ` ```js title="server.js" `. A change as a ` ```diff ` fence. A step-by-step build as a ` ```walkthrough ` fence, a session as ` ```agent-replay `.
- Asides as GitHub's alerts (`> [!TIP]`), one kind for each thing: note, tip, important, warning, caution. Not two in a row.
- Headings at two levels (`##`, `###`) under the page's title, which is the only `#`; `headingsOf(source)` gives them to a TableOfContents.

## 15. Finding your way

- **The Sidebar holds the sections**, a handful, without folding groups. The section of the page you are on is the active one.
- **Breadcrumbs hold the rest**: the path to the page, and its siblings behind each chevron.
- **TableOfContents** for the headings of a long page. Three levels in three places, each short.
- **The page's bar is `SidebarLayoutHeader`**, first in the page's column: breadcrumbs on the left, search and theme on the right. It stays at the top, brings the sidebar's toggle on a phone, and tells TableOfContents and headings its height, so no offset is set by hand.
- **A page without a sidebar** (a landing, a portfolio) takes `MorphHeader`: a bar across the top that turns into a pill once the page scrolls. Its `menu` says where the links go:
  - `responsive`, the default: inline while they fit, in the bar and in the pill; behind the menu button when they don't.
  - `scrolled`: inline at the top of the page, while the reader is deciding where to go; once scrolled, the pill holds only the logo and the menu button, so it takes as little room as it can while they read. The links fade before the pill folds, so keep the threshold low (`:scroll-threshold="8"`) for it to answer the first scroll.
  - `always`: only the logo and the menu button, at every width, for a site with many sections.

## 16. Setting up a project

- **Installing before npm.** Pack the library (`npm pack` in its folder) and install the `.tgz` from the project (`vendor/elastic-ui-x.y.z.tgz`). Installing the folder itself writes a path from your disk into `package.json` and links the library's own `node_modules`, with its own Vue.
- **CSS.** `@import "tailwindcss";`, then `@import "elastic-ui/tokens.css";` and `@source` pointing at the library's `dist`: it ships no compiled CSS, your Tailwind builds its classes.
- **Your language.** Set the library's own texts once, `app.use(ElasticUi, { labels: { copy: 'Copiar', onThisPage: 'En esta página', … } })`; a prop on a part still wins.
- **A router.** Links take `to` and render your RouterLink (`as` for another, such as NuxtLink), so navigating never reloads the page: `NavTreeItem`, `NavTreeGroup` (a section with its own page) and `Button`.
- **A forced theme without a flash.** ThemeToggle keeps the choice in `localStorage` under `elastic-ui.theme`. Read it before the page paints, in the `<head>`:

```html
<script>
  try {
    const theme = localStorage.getItem('elastic-ui.theme')
    if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme
  } catch {}
</script>
```

- **What scrolls.** Sticky parts and TableOfContents follow the window by default. If your layout scrolls a `<main>` instead, pass it to TableOfContents as `scroller`, or let the window scroll.

