# What the site found missing or awkward in the parts

Collected here as it's found (SITE.md); becomes library work on `main`, picked up on `site` by
merging `main` back in.

## TabsList scrolls the whole page into view on mount, not just its own row

`src/components/tabs/TabsList.vue`'s `moveToActive` calls
`active.scrollIntoView({ block: 'nearest', inline: 'nearest' })` on every placement, including the
first one on mount (`watch(tabs.value, () => nextTick(() => moveToActive(false)))` plus whatever
runs it once at the start). The comment above it says this is only meant to keep the active tab
in view *inside a tab list that scrolls sideways* (`inline: 'nearest'`), but `block: 'nearest'`
also asks every vertically-scrolling ancestor — including the window — to bring the element into
view. A page with many Tabs instances below the fold (the Components page's long list of story
previews, each its own Tabs) mounts several of them off-screen at once, and each one's own mount
nudges the window down to reveal it; the last one to mount wins, so the page loads scrolled
hundreds of pixels down instead of at the top.

Worked around on the site (`site/router.ts`'s `pinScroll`): after a route change it keeps the
window pinned on its intended target for as long as the page keeps mounting content underneath
it, undoing exactly this kind of nudge, and gives up the moment the visitor scrolls on their own.
That workaround is why the site still lands correctly, but it is a symptom fix; the library one
would scope the call to the tab list's own scroll container (e.g. only call it when
`list.scrollWidth > list.clientWidth`, or pass an explicit `boundary`), so a vertically off-screen
Tabs never moves the page in the first place.

## Toast's queue is one global singleton, not one per `<Toaster>`

`src/components/toast/toast.store.ts` keeps `toasts` as a module-level `shallowRef`, read by every
mounted `<Toaster>`. That's correct for an app with exactly one `<Toaster>` (the normal case,
and what Storybook shows, one story at a time) — but the Components page shows many stories of the
same part, and a part's own page keeps every one of its stories mounted at once (behind a
collapsed "All examples", `:unmount-on-hide="false"`): with several `<Toaster>` instances mounted
together, calling `toast()` from one of them shows the same toast in all of them at once.

Worked around on the site by keeping only one story live by default (ComponentPage.vue collapses
the rest, so only one `<Toaster>` is ever painted unless a visitor opens "All examples" — at which
point Toast's own page can still show it more than once, same as before). A library fix would
scope the queue with `provide`/`inject` from a `<Toaster>` instance down to whatever calls `toast()`
under it, the way `useSelect`/`useTabsContext` already scope their own state — `toast()` would need
a way to reach the nearest one (or fall back to a page-level default when called with no ancestor).
