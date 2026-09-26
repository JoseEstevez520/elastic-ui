# The library's site — plan

A site for elastic-ui: a landing that shows what the library is about, and a place to explore every part and learn to use it. It is built with the library itself, so the site is its first showcase: nothing on it should appear from nowhere that could grow out of something.

Read `DECISIONS.md` (design and code rules) and `USAGE.md` (how to use the library in a page) before starting. The site follows both, as any project using the library would.

## What the references do

- **shadcn/ui**: a landing with a few real screens built from the parts, then docs where each part has a live preview, its code a tab away, how to install it and its API. Short pages, one part each.
- **Magic UI, Aceternity**: a gallery of parts as live cards, each moving on its own; a part's page opens on a big preview.
- **Radix, Ark UI**: docs led by anatomy (the parts a component is made of), accessibility and the keyboard, and an API table per part.
- **motion.dev, Vercel's Geist**: a calm page, lots of room, one thing moving at a time, examples you can touch rather than videos.

What we take: live previews rather than pictures, the code one step away, one part per page, an API table, and a calm landing where a single thing leads (USAGE 2, "One thing leads").

## Where it lives

- A `site/` folder in this repository: a Vite + Vue 3 + vue-router app of its own, importing the library straight from `src/` (an alias), so the site always shows the current code without building the package first.
- It never ships with the package: `site/` stays out of `files` in `package.json` and out of the library build.
- `npm run site` (dev) and `npm run site:build` (static build) in the root `package.json`.
- Deployed later as a static site (GitHub Pages or Vercel); not part of this plan.

## Pages

### 1. Landing (`/`)

- **Hero**: the name, one line on the idea ("Things transform instead of appearing"), and one live demo that makes the point at once: a button that grows into a panel and folds back (PopoverMorph or DialogMorph), played once in view and then left for the visitor to press. Two actions: "Explore the parts" and "Get started".
- **The idea, shown**: three or four short sections, each one sentence and one live part, one after another (never side by side competing, USAGE 11): a field that grows into its list (Select), a message that flows in (Chat), a list whose items never overlap (AnimatedList), text that becomes other text (TextMorph). Each plays when it comes into view, one at a time (`usePlayInTurn`).
- **The rules in brief**: soft surfaces, one thing leads, appearing is not becoming; each a line with a link to its section in the principles page.
- **Footer**: repository, licence (MIT), the note that it is made for my own projects and shared as is.

### 2. Getting started (`/docs`)

- Installing from the repository at a tag (`npm install github:JoseEstevez520/elastic-ui#vX.Y.Z`), or from a `.tgz`.
- The CSS import, the theme script, `ElasticUi` with app-wide labels, router links: taken from `USAGE.md`, not rewritten from memory.

### 3. Principles (`/docs/principles`)

`DECISIONS.md`'s philosophy and `USAGE.md`'s rules, as readable pages with a live example per rule, rendered with the library's own `Markdown`/`Prose` where the text can be taken as it is.

### 4. Explore (`/components`)

- Every public part, grouped as in Storybook (Base, Forms, Navigation, AI, Explaining…), each as a card with a small live preview.
- A search field that filters the cards (SearchMorph or the Input), and the groups as a quiet filter.
- A card opens into its part's page: the card grows into the page's preview (ExpandableCard, or a shared-element transition on route change) rather than the page cutting in.

### 5. A part's page (`/components/:name`)

- Title, one-paragraph description (taken from the component's doc comment), and where it comes from when it was inspired by someone (credits already in the code).
- **Preview** with the code a tab away (Tabs, CodeBlock with CopyButton). The stories are the examples: render them with Storybook's `composeStories` from `@storybook/vue3-vite`, so each part's stories in `src/**/*.stories.ts` are its examples on the site as well, with no second copy to keep in step. Show the story's source as its code.
- **Situations**: the stories after the "Situations" comment, listed as the cases the part handles.
- **API**: props, events and slots per part, read from the source with `vue-component-meta` (already installed through Storybook) at build time into a JSON file, rendered as a plain table (Prose table). Types shown as written.
- **Keyboard and accessibility**, where the part has keys worth telling (from its doc comment or a short hand-written note).
- Previous and next part at the end.

## Layout and look

- `SidebarLayout` + `Sidebar` (`connected`) + `NavTree` for docs and parts; `SidebarLayoutHeader` with Breadcrumbs, the search (`CommandPalette` with ⌘K listing every page and part) and ThemeToggle.
- `TableOfContents` on long pages; `PageTransition` between pages.
- The landing has no sidebar: `MorphHeader` at the top.
- Light and dark from the start; works on a phone (sidebar as its panel, previews full width, code scrolling inside).
- No new visual language: tokens, radius, shadows and motion come from the library. If the site needs something the library lacks, it is written down as a need (see "What goes back to the library"), not styled ad hoc.

## Order of work

Each step ends with it running (`npm run site`), checked in light, dark and at phone width, and a commit.

1. **Scaffold**: `site/` with Vite, vue-router, the `src/` alias, the library's CSS and theme script; `npm run site`. An empty shell with the sidebar layout.
2. **A part's page** for one part (Button), end to end: story previews through `composeStories`, the code tab, the API table from `vue-component-meta`. Get this right before scaling it.
3. **All parts**: a registry generated from `src/components/*` and their stories, so a new part shows up without editing the site; NavTree and the Explore grid from it.
4. **Getting started and Principles** from `USAGE.md` and `DECISIONS.md`.
5. **Landing**.
6. **Search** (CommandPalette) and the card-to-page transition.
7. **A pass**: every page in light, dark and on a phone; nothing overlapping; one movement at a time.

## Rules for whoever builds it

- Everything in English: code, comments, texts, commits.
- Follow `DECISIONS.md` and `USAGE.md`; keep the code as clean as the library's.
- Do not change `src/` to make the site work. If a part needs a change, stop and write it in `SITE-NEEDS.md` (what, where, why), for it to be done in the library first.
- No attribution lines in commits (no `Co-Authored-By`, no "Generated with").
- Work on the `site` branch; do not merge into `main`.

## What goes back to the library

`SITE-NEEDS.md` collects what the site found missing or awkward in the parts, as the TEIS web did. Those become library work, done in `main`, and the site picks them up by merging `main` into `site`.
