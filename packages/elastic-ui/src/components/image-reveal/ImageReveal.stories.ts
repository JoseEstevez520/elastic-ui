import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Button from '../button/Button.vue'
import ImageReveal from './ImageReveal.vue'

// A landscape drawn inline, so the story needs no network.
const LANDSCAPE = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f9a8a8"/><stop offset="0.6" stop-color="#fcd9b0"/><stop offset="1" stop-color="#fde8c8"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#sky)"/>
  <circle cx="290" cy="120" r="42" fill="#fff4d6"/>
  <path d="M0 210 L90 130 L160 190 L240 110 L330 185 L400 150 L400 300 L0 300 Z" fill="#7c6bb0"/>
  <path d="M0 240 L70 200 L150 235 L230 190 L320 240 L400 215 L400 300 L0 300 Z" fill="#4c4a86"/>
  <path d="M0 270 Q100 250 200 268 T400 262 L400 300 L0 300 Z" fill="#2f2e5c"/>
</svg>`)}`

const meta = {
  title: 'AI/ImageReveal',
  component: ImageReveal,
  args: { alt: 'Mountains at sunset' },
  render: () => ({
    components: { Button, ImageReveal },
    setup() {
      const src = ref<string>()
      let timer: ReturnType<typeof setTimeout> | undefined
      const generate = () => {
        src.value = undefined
        clearTimeout(timer)
        timer = setTimeout(() => (src.value = LANDSCAPE), 2500)
      }
      return { src, generate }
    },
    template: `
      <div class="flex max-w-md flex-col gap-4">
        <ImageReveal :src="src" alt="Mountains at sunset" aspect="4 / 3" />
        <Button variant="outline" class="self-start" @click="generate">{{ src ? 'Generate again' : 'Generate' }}</Button>
      </div>`,
  }),
} satisfies Meta<typeof ImageReveal>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Generate: the box is an aurora thinking while the image is made, saying so. When it arrives it
 * shows deep in blur among the lights, then a band of light sweeps down it, the image sharp above
 * the band and still a blur below, until only the image is left.
 */
export const Default: Story = {}
