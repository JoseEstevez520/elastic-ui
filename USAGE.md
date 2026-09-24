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

## 4. Icons wherever they help

Give things an icon whenever one exists that says the same as the label: buttons, menu items, NavTree items and groups, badges, inputs.

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
