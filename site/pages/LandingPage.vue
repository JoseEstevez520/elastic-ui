<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { CodeBlock } from 'elastic-ui'
import { registry } from '../parts'

// A few parts worth a first look, linking straight into their section of the long Components
// page (ROADMAP.md, the site plan) rather than repeating a live demo here — this page reads like any other in
// the docs, not a second showcase competing with it.
const FEATURED = ['button', 'select', 'popover-morph', 'expandable-card', 'text-morph', 'animated-list']
const featured = computed(() => FEATURED.map((slug) => registry.find((entry) => entry.slug === slug)).filter((entry) => !!entry))
</script>

<template>
  <article class="prose article py-10">
    <h1>elastic-ui</h1>
    <p>
      A Vue component library where things transform instead of appearing: continuity over cuts, motion that explains
      rather than decorates. Built for my own projects, and shared as is.
    </p>

    <h2>Install</h2>
    <p>Pack the library and install the <code>.tgz</code>, or straight from the repository at a released tag:</p>
    <CodeBlock code="npm install github:JoseEstevez520/elastic-ui#v0.2.0" title="bash" />
    <p><RouterLink to="/docs">Get started</RouterLink> has the rest: the CSS import, the theme script, your own labels.</p>

    <h2>Where to go</h2>
    <ul>
      <li><RouterLink to="/docs">Get started</RouterLink> — install it and set it up in a project.</li>
      <li><RouterLink to="/docs/principles">Principles</RouterLink> — the rules the library and its parts are built by.</li>
      <li><RouterLink to="/components">Components</RouterLink> — every public part, live, one page.</li>
    </ul>

    <h2>A few parts</h2>
    <div class="not-prose grid grid-cols-1 gap-3 sm:grid-cols-2">
      <RouterLink
        v-for="entry in featured"
        :key="entry.slug"
        :to="`/components#${entry.slug}`"
        class="focus-ring flex flex-col gap-1 rounded-[var(--radius-xl)] bg-bg-subtle p-5 transition-colors hover:bg-bg-muted"
      >
        <span class="text-label text-fg">{{ entry.name }}</span>
        <span v-if="entry.description" class="line-clamp-2 text-copy text-fg-secondary">{{ entry.description }}</span>
      </RouterLink>
    </div>
  </article>
</template>
