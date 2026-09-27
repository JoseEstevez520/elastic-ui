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

Worked around on the site by neutralizing `scrollIntoView` only inside a couple of throwaway
Playwright probes (not shipped); not worked around in the app itself, since doing so from outside
would mean fighting the same call on every page. A fix in the library would scope the call to the
tab list's own scroll container (e.g. only call it when `list.scrollWidth > list.clientWidth`, or
pass an explicit `boundary`), so a vertically off-screen Tabs never moves the page.
