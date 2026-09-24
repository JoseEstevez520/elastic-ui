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
      fileName: 'elastic-ui',
    },
    rollupOptions: {
      // Consumers bring their own copies of these.
      external: ['vue', 'motion-v', 'reka-ui', 'class-variance-authority', 'clsx', 'tailwind-merge', /^torph/],
    },
  },
})
