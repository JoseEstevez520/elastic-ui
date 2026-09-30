import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Callout from '../callout/Callout.vue'
import CodeBlock from '../code-block/CodeBlock.vue'
import Prose from './Prose.vue'

const meta = {
  title: 'Text/Prose',
  component: Prose,
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { Callout, CodeBlock, Prose },
    template: `
      <Prose class="mx-auto max-w-2xl px-6 py-16">
        <h1>Docker in five minutes</h1>
        <p>A <strong>container</strong> packs an application with everything it needs to run, so it runs the same on your laptop and on the server. This page covers what you need for the practice; the <a href="#">official guide</a> has the rest.</p>
        <h2>Images and containers</h2>
        <p>An image is the recipe; a container is one run of it. You can start many containers from the same image, and removing one leaves the image as it was.</p>
        <ul>
          <li>An <code>image</code> is read-only, built once from a <code>Dockerfile</code>.</li>
          <li>A <code>container</code> is a running instance, with its own files and network.
            <ul><li>Stopping it keeps its files; removing it deletes them.</li></ul>
          </li>
          <li>A <code>volume</code> keeps data when the container goes.</li>
        </ul>
        <h3>Starting one</h3>
        <p>Run an Nginx server on port 8080, in the background:</p>
        <CodeBlock code="docker run -d -p 8080:80 --name web nginx:alpine" language="bash" />
        <Callout type="tip">Press <kbd>Ctrl</kbd> + <kbd>C</kbd> only stops a container started without <code>-d</code>.</Callout>
        <h2>The commands you will use</h2>
        <table>
          <thead><tr><th>Command</th><th>What it does</th></tr></thead>
          <tbody>
            <tr><td><code>docker ps</code></td><td>Lists the running containers.</td></tr>
            <tr><td><code>docker logs web</code></td><td>Shows what a container printed.</td></tr>
            <tr><td><code>docker stop web</code></td><td>Stops it, keeping its files.</td></tr>
            <tr><td><code>docker rm web</code></td><td>Removes it for good.</td></tr>
          </tbody>
        </table>
        <blockquote>A container is not a virtual machine: it shares the host's kernel, which is why it starts in a second.</blockquote>
        <ol>
          <li>Write a <code>Dockerfile</code>.</li>
          <li>Build it with <code>docker build -t app .</code></li>
          <li>Run it with <code>docker run app</code>.</li>
        </ol>
        <hr />
        <p>Next: putting several containers together with Compose.</p>
      </Prose>`,
  }),
} satisfies Meta<typeof Prose>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A page of notes: headings, paragraphs, lists, a table, a quote, inline code and keys, in grey with
 * the headings a step darker. The CodeBlock and the Callout keep their own look, spaced like a
 * paragraph.
 */
export const Default: Story = {}

/** Markdown rendered elsewhere, passed as `html`. */
export const FromHtml: Story = {
  args: {
    html: '<h2>What is a harness?</h2><p>The part of an agent that gives the model something to work with: it reads your files, runs commands and applies edits. See <a href="#">the agents page</a>.</p><pre><code>opencode run "explain this project"</code></pre>',
    class: 'mx-auto max-w-2xl px-6 py-16',
  },
}
