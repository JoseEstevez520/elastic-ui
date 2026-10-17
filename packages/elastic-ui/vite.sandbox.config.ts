import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// The sandbox runtime (`dist/sandbox-runtime.js`): Vue with its template compiler, the parts a
// piece can use and their CSS, in one classic script. Classic rather than a module: a module is
// fetched with CORS, and a sandboxed frame's origin is `null`, so the host would have to allow it.
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    // The build with the compiler: a piece's template is a string, compiled in the frame.
    alias: { vue: 'vue/dist/vue.esm-bundler.js' },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: fileURLToPath(new URL('./src/sandbox-runtime/runtime.ts', import.meta.url)),
      formats: ['iife'],
      name: 'ElasticUiSandbox',
      fileName: () => 'sandbox-runtime.js',
    },
  },
})
