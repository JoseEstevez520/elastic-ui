<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.png" />
    <img src="assets/logo.png" alt="elastic-ui" width="104" />
  </picture>
</p>

<h1 align="center">elastic-ui</h1>

<p align="center">
  <strong>elastic-ui turns the parts of a Vue interface into things that transform in place: a button becomes its dialog, a card opens into its detail.</strong>
</p>

<p align="center">
  For Vue 3 projects. Built for my own, and shared as is.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@joseestevez/vue-elastic-ui"><img src="https://img.shields.io/badge/npm-vue--elastic--ui-cb3837?style=flat-square&logo=npm&logoColor=white" alt="elastic-ui on npm"></a>
  <a href="packages/elastic-ui/USAGE.md"><img src="https://img.shields.io/badge/Docs-Read-2563eb?style=flat-square&logo=readthedocs&logoColor=white" alt="elastic-ui documentation"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-0f172a?style=flat-square&logo=opensourceinitiative&logoColor=white" alt="MIT license"></a>
</p>

<p align="center">
  <a href="#run-it-locally">Run locally</a> ·
  <a href="README.es.md">Español</a>
</p>

<p align="center">
  <img src="assets/readme/chat-morph.gif" alt="A button turns into a chat panel over a soft aurora; a typed question flies up into the conversation" width="100%">
</p>

## What is elastic-ui?

Most interfaces cut: a dialog appears, a tab switches, a list reorders in a single frame. The
eye has to work out what changed.

elastic-ui keeps the continuity. The button grows into its dialog, the tab's indicator travels
to the next tab, an answer flows in. Motion explains what changed instead of decorating, and
only one movement leads on each screen. It is a Vue 3 library built on Tailwind CSS v4,
[Reka UI](https://reka-ui.com) and [motion-v](https://motion.dev/docs/vue).

## How it works

Each part is built to transform in place, with the behavior (focus, keyboard, ARIA) coming from
Reka UI.

| Instead of | The part does |
|---|---|
| a dialog appearing | `DialogMorph`: the button's box travels to the middle of the screen and grows into the dialog, then folds back on close |
| a label swapping | `TextMorph`: the letters both texts share fly to their new places |
| a list jumping | `AnimatedList`: items find their new place when the list is filtered, sorted or changed |
| a tab indicator jumping | `Tabs`: the indicator travels to the next tab |

Every part has its stories and one story for each situation that matters. The rules are in
[DECISIONS.md](packages/elastic-ui/DECISIONS.md).

## What you can do today

- **Open** dialogs, popovers and cards from the element that triggers them: `DialogMorph`,
  `PopoverMorph`, `ExpandableCard`.
- **Write** short messages in a form that grows out of a button (`ComposeMorph`) and talk to an
  assistant (`ChatMorph`).
- **Replay** agent sessions and terminal commands step by step: `AgentReplay`,
  `TerminalReplay`.
- **Show** data and structure with `Chart`, `Diagram`, `Table` and `Timetable`.
- **Build** forms, navigation and overlays from around sixty public parts in nine families.
- **Browse** every part live on the site and in Storybook.

<h2 align="center">See elastic-ui in action</h2>

<p align="center">
  <a href="assets/readme/dynamic-island.mp4"><img src="assets/readme/dynamic-island.gif" alt="A black pill changes shape for music, a timer, an upload and a call" width="100%"></a>
</p>

<p align="center"><sub><code>DynamicIsland</code>: a pill that takes the shape of what it shows.</sub></p>

## Run it locally

```bash
npm install
npm run storybook   # http://localhost:6006
npm run site        # the site at http://localhost:5173
```

The root commands delegate to the packages:

```bash
npm run build           # build the library
npm run build-storybook # static Storybook
npm run typecheck       # library and site
npm run site:build      # static site
npm run site:check      # every story fits its frame, on a desktop and a phone
```

To use the library in a project, install it from npm and follow
[the package's README](packages/elastic-ui/README.md):

```bash
npm install @joseestevez/vue-elastic-ui motion-v
```

## Documentation

- [Using elastic-ui](packages/elastic-ui/USAGE.md): the rules for building with it, for people and coding agents alike.
- [Design decisions](packages/elastic-ui/DECISIONS.md): how it is made and why.
- [Roadmap](ROADMAP.md): where it is and what comes next.
- [AGENTS.md](AGENTS.md): working conventions for this repo.

## Ecosystem

[Kolmi](https://github.com/JoseEstevez520/Kolmi) is built with elastic-ui. It is a separate
project and elastic-ui doesn't depend on it.

## License

elastic-ui is open source under the [MIT license](LICENSE). Security issues should follow
[SECURITY.md](SECURITY.md), never a public issue.
