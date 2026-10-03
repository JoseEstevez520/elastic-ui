<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.png" />
    <img src="assets/logo.png" alt="" width="96" />
  </picture>
</p>

# elastic-ui

A Vue 3 component library where things transform instead of appearing, and the site that shows it. The repository is a workspace with two packages:

- `packages/elastic-ui` — the library, published on npm as [`@joseestevez/vue-elastic-ui`](https://www.npmjs.com/package/@joseestevez/vue-elastic-ui).
- `site` — the library's site: a landing and the docs, built with the library itself.

## Getting started

```bash
npm install
npm run storybook   # http://localhost:6006
```

The root commands delegate to the packages:

```bash
npm run build           # build the library
npm run build-storybook # static Storybook
npm run typecheck       # library and site
npm run site            # the site at http://localhost:5173
npm run site:build      # static site
```

## Docs

- [Using elastic-ui](packages/elastic-ui/USAGE.md) — the rules for building with it, for people and coding agents alike.
- [Design decisions](packages/elastic-ui/DECISIONS.md) — how it is made and why.
- [Roadmap](ROADMAP.md) — where it is and what comes next.
- [AGENTS.md](AGENTS.md) — working conventions for this repo.

## License

MIT.
