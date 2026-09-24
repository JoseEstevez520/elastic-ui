import type { Preview } from '@storybook/vue3-vite'
import './preview.css'

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (story, context) => {
      document.documentElement.dataset.theme = context.globals.theme
      return story()
    },
  ],
  parameters: {
    layout: 'centered',
    backgrounds: { disable: true },
  },
}

export default preview
