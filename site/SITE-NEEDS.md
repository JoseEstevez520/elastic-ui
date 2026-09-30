# What the site found missing or awkward in the parts

Collected as the site is built, for the library to fix before the site works around it (ROADMAP.md, "The library's site"). Both items the site first hit are fixed in the library, so nothing is open here.

## TabsList moved the whole page into view on mount — fixed

`TabsList` kept the active tab in view with `scrollIntoView`, which also dragged every scrolling ancestor, the window included, so a page with several Tabs below the fold loaded scrolled down. `76ffc80` scopes the scroll to the tab list's own container, so a Tabs out of view no longer moves the page.

## Toast's queue was one global singleton — fixed

`f7b7f96` gives each `<Toaster>` a queue of its own (`createToastStore()`, the `store` prop), with `provideToasts`/`useToasts()` to scope it; `toast()` still fills the app's queue for the usual one-Toaster app.

The site keeps two things for reasons of its own, not for these: `router.ts`'s `pinScroll` waits for a page's lazy content to settle before it lands on a scroll target, and a part's page shows one story live at a time so a part with many stories stays light.
