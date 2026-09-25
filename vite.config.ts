import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    dts({ tsconfigPath: './tsconfig.app.json', entryRoot: 'src', exclude: ['src/**/*.stories.ts', 'src/**/*.fixtures.ts'] }),
  ],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
    },
    rollupOptions: {
      // Consumers bring their own copies of these.
      external: ['vue', 'motion-v', 'reka-ui', '@lucide/vue', 'class-variance-authority', 'clsx', 'tailwind-merge', /^torph/, 'markdown-it', /^@internationalized/],
      // One file per module, as in the source: a project's bundler drops whole files it does not
      // reach, and what each part weighs can be measured.
      output: { preserveModules: true, preserveModulesRoot: 'src', entryFileNames: '[name].js' },
    },
  },
})
