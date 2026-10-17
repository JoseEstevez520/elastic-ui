<script lang="ts">
import { computed, defineComponent, getCurrentInstance, h, type Component, type HTMLAttributes, type PropType, type VNode, type VNodeChild } from 'vue'
import { cn } from '../../utils/cn'
import { isExternal } from '../../utils/link'
import type { AgentReplayEvent } from '../agent-replay/agent-replay.types'
import AgentReplay from '../agent-replay/AgentReplay.vue'
import Callout, { type CalloutType } from '../callout/Callout.vue'
import CodeBlock from '../code-block/CodeBlock.vue'
import CodeDiff from '../code-diff/CodeDiff.vue'
import CodeWalkthrough from '../code-walkthrough/CodeWalkthrough.vue'
import CodeWalkthroughStep from '../code-walkthrough/CodeWalkthroughStep.vue'
import TerminalReplay from '../terminal-replay/TerminalReplay.vue'
import { markdown, parseInfo, parseTerminal, slugify, splitDiff, textOf, uniqueSlug, type Token } from './markdown.utils'

const ALERT = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/
// A list item opening with `[ ]` or `[x]` is a task, as in GitHub.
const TASK = /^\[([ xX])\]\s+/

/**
 * Markdown as the library's parts, in an article's type (Prose). Written as it always is, it turns
 * into the parts, not into plain HTML:
 *
 * - a code fence into a CodeBlock (```js title="server.js"), a `diff` fence into a CodeDiff that
 *   plays the edit, with `-` and `+` lines as any diff, and a `terminal` fence into a TerminalReplay
 *   (`$ ` a command, `# ` a comment, anything else what it printed);
 * - GitHub's alerts (`> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`) into Callouts;
 * - GitHub's task lists (`- [ ]`, `- [x]`) into items with their box, shown and not ticked from here;
 * - a `walkthrough` fence into a CodeWalkthrough and an `agent-replay` fence into an AgentReplay,
 *   both written as JSON (a step's `text` is Markdown too; an event's `icon` names one in `icons`);
 * - headings into anchors with GitHub's ids (`headingsOf` gives them to a TableOfContents);
 * - a link within the site into the app's RouterLink, so it never reloads the page, and one to
 *   another site into a new tab;
 * - a table into one as wide as the text, scrolling sideways when it is wider.
 *
 * Other fences can become any component through `components`, by language.
 */
export default defineComponent({
  name: 'Markdown',
  props: {
    source: { type: String, required: true },
    /** Components for other fences, by language: each gets `code` and the fence's `key=value`s. */
    components: { type: Object as PropType<Record<string, Component>>, default: () => ({}) },
    /** Icons an `agent-replay` fence can name. */
    icons: { type: Object as PropType<Record<string, Component>>, default: () => ({}) },
    as: { type: String, default: 'div' },
    class: { type: [String, Array, Object] as PropType<HTMLAttributes['class']>, default: undefined },
  },
  setup(props) {
    // Registered by `app.use(router)`; without a router, links stay plain.
    const routerLink = getCurrentInstance()?.appContext.components.RouterLink

    function link(href: string, children: VNodeChild[]): VNode {
      if (isExternal(href)) return h('a', { href, target: '_blank', rel: 'noopener noreferrer' }, children)
      if (routerLink && !href.startsWith('#')) return h(routerLink, { to: href }, () => children)
      return h('a', { href }, children)
    }

    function inline(tokens: Token[]): VNodeChild[] {
      const root: VNodeChild[] = []
      const stack: { tag: string; href?: string; children: VNodeChild[] }[] = []
      const out = () => stack.at(-1)?.children ?? root
      for (const token of tokens) {
        if (token.type === 'text') out().push(token.content)
        else if (token.type === 'code_inline') out().push(h('code', token.content))
        else if (token.type === 'softbreak') out().push('\n')
        else if (token.type === 'hardbreak') out().push(h('br'))
        else if (token.type === 'html_inline') out().push(h('span', { innerHTML: token.content }))
        else if (token.type === 'image')
          out().push(h('img', { src: token.attrGet('src'), alt: token.content, title: token.attrGet('title') ?? undefined, loading: 'lazy', decoding: 'async' }))
        else if (token.nesting === 1) stack.push({ tag: token.tag, href: token.attrGet('href') ?? undefined, children: [] })
        else if (token.nesting === -1) {
          const frame = stack.pop()!
          out().push(frame.tag === 'a' ? link(frame.href ?? '', frame.children) : h(frame.tag, frame.children))
        }
      }
      return root
    }

    function fence(token: Token): VNode {
      return part(token)
    }

    function part(token: Token): VNode {
      const { language, attrs } = parseInfo(token.info)
      const code = token.content.replace(/\n$/, '')
      const title = attrs.title ?? attrs.file
      const custom = props.components[language]
      if (custom) return h(custom, { code, ...attrs })
      try {
        if (language === 'diff') return h(CodeDiff, { ...splitDiff(code), file: title })
        if (language === 'terminal') return h(TerminalReplay, { entries: parseTerminal(code), title })
        if (language === 'agent-replay') {
          const data = JSON.parse(code) as { events: (AgentReplayEvent & { icon?: string })[]; intro?: string }
          const events = data.events.map((event) =>
            'icon' in event && typeof event.icon === 'string' ? { ...event, icon: props.icons[event.icon] } : event,
          )
          return h(AgentReplay, { events: events as AgentReplayEvent[], intro: data.intro, layout: attrs.layout as 'side' | 'stacked' })
        }
        if (language === 'walkthrough') {
          const data = JSON.parse(code) as { steps: { title?: string; file?: string; code: string; highlight?: string; text?: string }[] }
          return h(CodeWalkthrough, null, () =>
            data.steps.map((step) =>
              h(CodeWalkthroughStep, { title: step.title, file: step.file, code: step.code, highlight: step.highlight }, () =>
                h('div', { class: 'prose text-ui' }, build(markdown.parse(step.text ?? '', {}))),
              ),
            ),
          )
        }
      } catch {
        // Written wrong: shown as the code it is, rather than lost.
      }
      return h(CodeBlock, { code, language: language || undefined, title })
    }

    // Builds the block tokens into elements and parts, level by level.
    function build(tokens: Token[]): VNodeChild[] {
      const root: VNodeChild[] = []
      type Frame = { token: Token; children: VNodeChild[]; alert?: CalloutType; done?: boolean }
      const stack: Frame[] = []
      const out = () => stack.at(-1)?.children ?? root
      const seen = new Map<string, number>()

      tokens.forEach((token, i) => {
        if (token.type === 'inline') return out().push(...inline(token.children ?? []))
        if (token.type === 'fence') return out().push(fence(token))
        if (token.type === 'code_block') return out().push(h(CodeBlock, { code: token.content.replace(/\n$/, '') }))
        if (token.type === 'hr') return out().push(h('hr'))
        if (token.type === 'html_block') return out().push(h('div', { innerHTML: token.content }))

        if (token.nesting === 1) {
          const frame: Frame = { token, children: [] }
          // `> [!TIP]` opening a quote makes it a Callout; the marker itself is dropped.
          if (token.type === 'blockquote_open') {
            const first = tokens[i + 2]
            const match = first?.type === 'inline' ? ALERT.exec(first.content) : null
            if (first && match) {
              frame.alert = match[1]!.toLowerCase() as CalloutType
              const [head, next] = first.children ?? []
              if (head?.type === 'text') head.content = head.content.replace(ALERT, '')
              if (head && !head.content && next?.type === 'softbreak') first.children!.splice(0, 2)
            }
          }
          // `- [ ]` and `- [x]` make the item a task: a box (shown, not ticked from here) where
          // the bullet was, and the marker dropped from its text.
          if (token.type === 'list_item_open') {
            const first = tokens[i + 2]
            const match = first?.type === 'inline' ? TASK.exec(first.content) : null
            const head = first?.children?.[0]
            if (match && head?.type === 'text') {
              frame.done = match[1] !== ' '
              head.content = head.content.replace(TASK, '')
            }
          }
          stack.push(frame)
          return
        }
        if (token.nesting !== -1) return

        const frame = stack.pop()!
        const open = frame.token
        const children = frame.children
        // A tight list's paragraphs are hidden: their text goes straight into the item.
        if (open.hidden) return out().push(...children)
        if (frame.alert) return out().push(h(Callout, { type: frame.alert }, () => children))
        if (open.type === 'heading_open') {
          const id = uniqueSlug(slugify(textOf(tokens[tokens.indexOf(open) + 1])), seen)
          return out().push(h(open.tag, { id }, children))
        }
        if (frame.done !== undefined) {
          const box = h('input', { type: 'checkbox', checked: frame.done, disabled: true })
          return out().push(h('li', [box, ...children]))
        }
        if (open.type === 'table_open') return out().push(h('div', { class: 'prose-table' }, [h('table', children)]))
        const attrs = Object.fromEntries(open.attrs ?? [])
        out().push(h(open.tag, attrs, children))
      })
      return root
    }

    const content = computed(() => build(markdown.parse(props.source, {})))
    return () => h(props.as, { class: cn('prose', props.class) }, content.value)
  },
})
</script>
