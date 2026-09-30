<script setup lang="ts">
import type { Component } from 'vue'
import { CodeBlock, Tabs, TabsContent, TabsList, TabsTrigger } from 'elastic-ui'
import type { StoryInfo } from '../parts'

/**
 * One story of a part: its live preview, with its source a tab away (ROADMAP.md, the site plan). The preview is
 * framed because it is real grouping, and anchored at the top left, as on a page: a centred story
 * moves as a part grows, so its motion could not be judged.
 */
const props = withDefaults(
  defineProps<{
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
        <div class="story-stage rounded-[var(--radius-xl)] border border-border p-6">
          <component :is="props.component" v-if="props.component" />
        </div>
      </TabsContent>
      <TabsContent value="code">
        <CodeBlock :code="story.source" :title="story.file" language="TypeScript" />
      </TabsContent>
    </Tabs>
  </section>
</template>
