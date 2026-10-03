import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  // The sandbox runtime, served as a host would serve it, for SandboxFrame's pieces made of the
  // library's parts. Built before Storybook starts (`prestorybook`); served as a plain file, so a
  // new build shows on the next reload.
  staticDirs: [{ from: '../dist', to: '/runtime' }],
  framework: {
    name: '@storybook/vue3-vite',
    options: { docgen: 'vue-component-meta' },
  },
}

export default config
