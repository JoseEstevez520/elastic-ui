import { h, type FunctionalComponent } from 'vue'

// The icons the library's own parts need come from Lucide, as a project's own icons most often
// do, so they match. Named here for what they mean to the library, so a part says `XIcon` and the
// set behind it could change in one place.
export {
  CircleAlert as AlertIcon,
  ArrowDown as ArrowDownIcon,
  Check as CheckIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Copy as CopyIcon,
  ListFilter as FilterIcon,
  Info as InfoIcon,
  File as FileIcon,
  Lightbulb as LightbulbIcon,
  Minus as MinusIcon,
  OctagonAlert as OctagonAlertIcon,
  Pause as PauseIcon,
  Play as PlayIcon,
  Plus as PlusIcon,
  RotateCcw as ReplayIcon,
  Search as SearchIcon,
  TriangleAlert as TriangleAlertIcon,
  Upload as UploadIcon,
  X as XIcon,
} from '@lucide/vue'

/** A rounded square, filled: stop. Lucide's square is only an outline. */
export const StopIcon: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'currentColor' }, [h('rect', { x: 6, y: 6, width: 12, height: 12, rx: 2.5 })])
