# Using elastic-ui

Rules for building with the library, for people and for coding agents alike. How the library itself is made lives in `DECISIONS.md`; this is how to use it well in a project.

## 1. Morph by default

Where there is a morphing version, use it. The library's personality is things turning into other things, and a plain panel appearing from nowhere is the exception, not the rule.

| For | Use | Fall back to the plain one when |
|---|---|---|
| A panel from a button | `PopoverMorph` | the trigger sits near a screen edge, or moves (in a scrolling list, a table row) |
| A short menu | `PopoverMorph role="menu"` + `PopoverMorphItem` | it has submenus, scrolls, or the trigger is near an edge: `Menu` |
| A dialog | `DialogMorph` | there is no button to grow from (opened by the app, a route, a shortcut) |
| Picking one value | `Select` | — |
| Cards that open | `ExpandableCard` in an `ExpandableCardGroup` | the content is a page of its own: link to it |

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
- A line that doesn't fit ends in a fading edge (`mask-fade-r`, `ExpandableCardText`), never an ellipsis.
- Inside anything that morphs, don't let a height depend on the width: keep such text to one line.

## 7. Accessible as you use it

- Every `DialogMorph` has a `DialogMorphTitle`.
- A field without a visible label gets an `aria-label`; one that needs fixing gets `invalid` and a message linked with `aria-describedby`.
- `NavTree` is bound to the current route with `v-model`, so the active item carries `aria-current`.
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
- **Between pages, only the content changes.** The Sidebar, the header and the search stay still; the sidebar's tab slides to the new page and the breadcrumbs morph their words. The old content leaves at once, the new comes in as a wave, block by block, and the scroll goes back to the top before it does. No fades of the whole page, no slides from the side.

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

