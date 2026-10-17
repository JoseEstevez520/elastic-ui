import * as Vue from 'vue'
import {
  AnimatedList,
  Badge,
  BadgeCount,
  Button,
  Callout,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Chart,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DescriptionItem,
  DescriptionList,
  Diagram,
  DiagramArea,
  DiagramArrow,
  DiagramChip,
  DiagramGroup,
  DiagramItem,
  ElasticUi,
  Field,
  Input,
  NumberField,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Slider,
  Stat,
  StatGroup,
  StatusText,
  Steps,
  StepsItem,
  StepsNext,
  Switch,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  TextMorph,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  type Labels,
} from '../index'
import css from './runtime.css?inline'
import { scriptBody, splitPiece } from './piece'

/**
 * The parts a piece can use, registered by name: what a small explaining toy is made of
 * (controls, figures, the diagram's parts, a chart, text that morphs). Page-level parts
 * (navigation, overlays that grow over the page, chat) are left out: a piece lives in a frame
 * as tall as itself, and each part costs every page that loads the runtime.
 */
const Parts = {
  AnimatedList,
  Badge,
  BadgeCount,
  Button,
  Callout,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Chart,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DescriptionItem,
  DescriptionList,
  Diagram,
  DiagramArea,
  DiagramArrow,
  DiagramChip,
  DiagramGroup,
  DiagramItem,
  Field,
  Input,
  NumberField,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Slider,
  Stat,
  StatGroup,
  StatusText,
  Steps,
  StepsItem,
  StepsNext,
  Switch,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  TextMorph,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
}

// First in the head, so the theme the frame is given (resolved for the page's theme, and
// replaced when it changes) comes later and wins over the defaults in tokens.css.
function addStyles() {
  if (document.getElementById('elastic-ui-runtime')) return
  const style = document.createElement('style')
  style.id = 'elastic-ui-runtime'
  style.textContent = css
  document.head.prepend(style)
}

function showError(target: Element, error: unknown) {
  console.error(error)
  const message = document.createElement('p')
  message.style.color = 'var(--color-danger)'
  message.textContent = `This piece could not run: ${error instanceof Error ? error.message : String(error)}`
  target.replaceChildren(message)
}

/**
 * Mounts a piece, a Vue single-file component as a string, on `target` (`#app` by default):
 * its template is compiled here, its plain `<script>` runs with `vue` and the library's parts as
 * its only imports, and every part in `Parts` is available in the template by name.
 */
export function mount(source: string, options: { target?: string | Element; labels?: Partial<Labels> } = {}) {
  addStyles()
  const target = typeof options.target === 'object' ? options.target : document.querySelector(options.target ?? '#app')
  if (!target) throw new Error('Nowhere to mount the piece.')
  try {
    const { template, script, style } = splitPiece(source)
    const component = script ? new Function('Vue', 'Parts', scriptBody(script))(Vue, Parts) : {}
    if (style) {
      const sheet = document.createElement('style')
      sheet.textContent = style
      document.head.append(sheet)
    }
    // Registered on the piece itself, not app-wide: a part that renders a plain `button` through
    // `<component :is>` would otherwise resolve it to the registered Button, and itself, forever.
    const app = Vue.createApp({ ...component, components: { ...Parts, ...component.components }, template })
    app.use(ElasticUi, { labels: options.labels })
    app.config.errorHandler = (error) => showError(target, error)
    app.mount(target)
    return app
  } catch (error) {
    showError(target, error)
  }
}

export { Parts, Vue }
