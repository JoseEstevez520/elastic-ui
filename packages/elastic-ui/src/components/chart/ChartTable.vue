<script setup lang="ts">
/**
 * The chart's data as a table, for screen readers: the drawing says nothing to them, and the
 * tooltip only one value at a time. Rows and columns come ready from Chart.
 */
defineProps<{
  caption: string
  columns: string[]
  rows: string[][]
}>()
</script>

<template>
  <table class="sr-only">
    <caption>{{ caption }}</caption>
    <thead>
      <tr>
        <th v-for="column in columns" :key="column" scope="col">{{ column }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, i) in rows" :key="i">
        <th scope="row">{{ row[0] }}</th>
        <td v-for="(cell, j) in row.slice(1)" :key="j">{{ cell }}</td>
      </tr>
    </tbody>
  </table>
</template>
