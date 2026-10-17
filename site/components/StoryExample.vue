<script setup lang="ts">
import type { Component } from 'vue'
import { CodeBlock, Tabs, TabsContent, TabsList, TabsTrigger } from 'elastic-ui'
import type { StoryInfo } from '../parts'
import StoryFrame from './StoryFrame.vue'

/**
 * One story of a part: its live preview, with its source a tab away (ROADMAP.md, the site plan).
 * The preview is framed because it is real grouping; how it fits its frame is StoryFrame's.
 */
withDefaults(
  defineProps<{
    slug: string
    story: StoryInfo
    component?: Component
    /** Deeper when listed under Situations. */
    level?: 2 | 3
  }>(),
  { level: 2 },
)
</script>

<template>
  <section>
    <component :is="level === 2 ? 'h2' : 'h3'">{{ story.name }}</component>
    <p v-if="story.docs">{{ story.docs }}</p>
    <Tabs default-value="preview" class="not-prose">
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="preview">
        <StoryFrame :slug="slug" :story="story" :component="component" />
      </TabsContent>
      <TabsContent value="code">
        <CodeBlock :code="story.source" :title="story.file" language="TypeScript" />
      </TabsContent>
    </Tabs>
  </section>
</template>
