import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// The site is the library's first consumer: it imports the source straight, as a project would
// import the package, so it always shows the current code without building the library first.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: /^elastic-ui\/tokens\.css$/,
        replacement: fileURLToPath(new URL('../packages/elastic-ui/src/styles/tokens.css', import.meta.url)),
      },
      { find: /^elastic-ui$/, replacement: fileURLToPath(new URL('../packages/elastic-ui/src/index.ts', import.meta.url)) },
      // Stories rendered live (ROADMAP.md, the site plan) come straight from Storybook, and several build their
      // preview from an inline `template` string, which needs the runtime compiler: the default,
      // smaller build only understands compiled render functions.
      { find: 'vue', replacement: 'vue/dist/vue.esm-bundler.js' },
    ],
  },
})
