import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'

// SandboxFrame's stories run pieces made of the library's parts, which need the sandbox runtime
// served where they ask for it (`/runtime/sandbox-runtime.js`), as Storybook serves it. Built by
// the package (`build:sandbox`, run before the site starts or builds).
const runtimePath = fileURLToPath(new URL('../packages/elastic-ui/dist/sandbox-runtime.js', import.meta.url))
const sandboxRuntime = (): Plugin => ({
  name: 'sandbox-runtime',
  configureServer(server) {
    server.middlewares.use('/runtime/sandbox-runtime.js', (_request, response) => {
      response.setHeader('Content-Type', 'text/javascript')
      response.end(readFileSync(runtimePath))
    })
  },
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'runtime/sandbox-runtime.js', source: readFileSync(runtimePath) })
  },
})

// The site is the library's first consumer: it imports the source straight, as a project would
// import the package, so it always shows the current code without building the library first.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [vue(), tailwindcss(), sandboxRuntime()],
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
