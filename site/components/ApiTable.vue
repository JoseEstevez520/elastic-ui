<script setup lang="ts">
import type { ApiPart } from '../parts'

/**
 * One component's API as plain Prose tables: props, events and slots, with the types as written
 * in the source (SITE.md §5). A table wider than the text scrolls inside its `prose-table`.
 */
defineProps<{
  part: ApiPart
  /** Families of more than one documented part name each one. */
  named?: boolean
}>()
</script>

<template>
  <section>
    <h3 v-if="named">{{ part.name }}</h3>
    <p v-if="named && part.description">{{ part.description }}</p>

    <template v-if="part.props.length">
      <p><strong>Props</strong></p>
      <div class="prose-table">
        <table>
          <thead>
            <tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr v-for="prop in part.props" :key="prop.name">
              <td><code>{{ prop.name }}{{ prop.required ? '*' : '' }}</code></td>
              <td><code>{{ prop.type }}</code></td>
              <td><code v-if="prop.default !== undefined">{{ prop.default }}</code><template v-else>—</template></td>
              <td>{{ prop.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-if="part.events.length">
      <p><strong>Events</strong></p>
      <div class="prose-table">
        <table>
          <thead>
            <tr><th>Name</th><th>Type</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr v-for="event in part.events" :key="event.name">
              <td><code>{{ event.name }}</code></td>
              <td><code>{{ event.type }}</code></td>
              <td>{{ event.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-if="part.slots.length">
      <p><strong>Slots</strong></p>
      <div class="prose-table">
        <table>
          <thead>
            <tr><th>Name</th><th>Type</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr v-for="slot in part.slots" :key="slot.name">
              <td><code>{{ slot.name }}</code></td>
              <td><code>{{ slot.type }}</code></td>
              <td>{{ slot.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </section>
</template>
