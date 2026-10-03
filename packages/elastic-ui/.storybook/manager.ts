import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'

// The library's mark at the top of Storybook's sidebar.
addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'elastic-ui',
    brandImage: '/brand/logo.png',
    brandTarget: '_self',
  }),
})
