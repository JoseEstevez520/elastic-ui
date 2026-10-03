# elastic-ui

A Vue 3 component library where things transform instead of appearing: a button grows into its dialog, a tab's indicator travels to the next tab, an answer flows in as a wave. Clean, soft and quiet, with one movement leading on each screen.

Built on Vue 3, Tailwind CSS v4, [Reka UI](https://reka-ui.com) and [motion-v](https://motion.dev/docs/vue).

## What is in it

| Family | Parts |
|---|---|
| Actions | Button, CopyButton, ProgressButton, ThemeToggle, ComposeMorph |
| Forms | Input, Textarea, Select, Checkbox, Switch, Filters |
| Overlays | Popover, PopoverMorph, Menu, Tooltip, DialogMorph, CommandPalette, Toast, SelectionMenu |
| Disclosure | Collapsible, Accordion, Tabs, Steps, ExpandableCard |
| Navigation | Sidebar, NavTree, MorphHeader, Breadcrumbs, TableOfContents, SearchMorph, ScrollIndicator |
| Content | Card, Badge, Callout, AnimatedList, DynamicIsland |
| Text | TextMorph, StatusText, TruncatedText, Prose, Markdown |
| Code | CodeBlock, CodeDiff, CodeWalkthrough, TerminalReplay |
| AI | Chat, ChatMorph, Aurora, AgentReplay, ImageReveal |

## Install

Published on npm as [`@joseestevez/vue-elastic-ui`](https://www.npmjs.com/package/@joseestevez/vue-elastic-ui):

```bash
npm install @joseestevez/vue-elastic-ui motion-v
```

`motion-v` comes with it because it is a peer dependency; Vue and Tailwind CSS v4 are expected
in the project.

The library ships no compiled CSS: the project's Tailwind builds its classes. In its main stylesheet:

```css
@import "tailwindcss";
@import "@joseestevez/vue-elastic-ui/tokens.css";
@source "../node_modules/@joseestevez/vue-elastic-ui/dist";
```

Then use the parts:

```vue
<script setup>
import { Button, PopoverMorph, PopoverMorphItem } from '@joseestevez/vue-elastic-ui'
import { Pencil, Trash2 } from '@lucide/vue'
</script>

<template>
  <PopoverMorph role="menu" label="Actions">
    <template #trigger>Actions</template>
    <PopoverMorphItem :icon="Pencil">Rename</PopoverMorphItem>
    <PopoverMorphItem :icon="Trash2">Delete</PopoverMorphItem>
  </PopoverMorph>
</template>
```

## In your language

Every text the library writes on its own (names for screen readers, placeholders, default titles) can be set once:

```js
import { ElasticUi } from '@joseestevez/vue-elastic-ui'

app.use(ElasticUi, { labels: { copy: 'Copiar', onThisPage: 'En esta página' } })
```

## Themes

Every colour holds both themes through `light-dark()`, so the theme follows the system. `data-theme="light"` or `"dark"` on `<html>` forces one, and ThemeToggle switches it. Customize from the outside in: global tokens on `:root` (`--color-accent`, `--radius-md`…), then a part's own tokens (`--card-radius`, `--popover-bg`…), then variants, then `class`.

## Using it well

- [`USAGE.md`](./USAGE.md): the rules for building with it, for people and coding agents alike.
- [`DECISIONS.md`](./DECISIONS.md): how it is made and why.
- `npm run storybook`: every part, by family, in every situation that matters.

## License

MIT.
