# Design decisions — elastic-ui

A Vue component library for my own projects, built to adapt to very different use cases.

## Stack

- **Vue 3** + TypeScript
- **Tailwind v4**: tokens are defined as CSS variables with `@theme`
- **motion-v** for animations (declarative, `layout` / `layoutId` for morphs)

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
