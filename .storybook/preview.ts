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
    // Anchored at the top left, as on a page, rather than centred: a centred story moves as a
    // part grows or shrinks (a pill added, a field widening), which no page would do, so its
    // motion could not be judged.
    layout: 'padded',
    backgrounds: { disable: true },
  },
}

export default preview
