// For the stories only: diagrams drawn with the diagram classes, shared by Diagram's and
// PageSection's stories.
import { Box, Brain, FileCode, FilePen, FolderOpen, Hammer, Layers, ScrollText, ShieldCheck, SquareTerminal, User } from '@lucide/vue'

export const PARTS_SVG = `<svg viewBox="0 0 640 260" class="diagram w-full">
          <g class="diagram-in">
            <rect class="diagram-part" style="--diagram-color: var(--color-fg-muted)" x="0" y="112" width="84" height="36" />
            <text class="diagram-label" style="--diagram-color: var(--color-fg-muted)" x="42" y="135" text-anchor="middle">You</text>
          </g>
          <g class="diagram-in" style="--diagram-color: #0d9488">
            <rect class="diagram-part" x="150" y="16" width="300" height="228" />
            <text class="diagram-label" x="166" y="40">Harness</text>
            <text class="diagram-text" x="166" y="58">tools, instructions, permissions</text>
          </g>
          <g class="diagram-in" style="--diagram-color: #7c3aed">
            <rect class="diagram-part" x="240" y="78" width="120" height="40" style="fill: color-mix(in oklab, #7c3aed 22%, var(--color-bg))" />
            <text class="diagram-label" x="300" y="103" text-anchor="middle">Model</text>
          </g>
          <g class="diagram-in" style="--diagram-color: #0d9488">
            <rect class="diagram-part" x="176" y="172" width="76" height="34" style="fill: var(--color-bg)" />
            <text class="diagram-label" x="214" y="194" text-anchor="middle">Read</text>
            <rect class="diagram-part" x="262" y="172" width="76" height="34" style="fill: var(--color-bg)" />
            <text class="diagram-label" x="300" y="194" text-anchor="middle">Edit</text>
            <rect class="diagram-part" x="348" y="172" width="76" height="34" style="fill: var(--color-bg)" />
            <text class="diagram-label" x="386" y="194" text-anchor="middle">Run</text>
          </g>
          <g class="diagram-in">
            <rect class="diagram-part" style="--diagram-color: #ca8a04" x="516" y="112" width="124" height="36" />
            <text class="diagram-label" style="--diagram-color: #ca8a04" x="578" y="135" text-anchor="middle">Your project</text>
          </g>
          <g class="diagram-in">
            <path class="diagram-line" d="M84 130 C150 130 180 98 240 98" />
            <path class="diagram-quiet" d="M270 118 L214 172 M330 118 L386 172" />
            <path class="diagram-emphasis" d="M300 118 L300 172 M300 206 C300 250 500 250 540 148" />
          </g>
        </svg>`

export const TREND_SVG = `<svg viewBox="0 0 560 230" class="diagram w-full">
          <g class="diagram-in">
            <path class="diagram-grid" d="M28 50 H430 M28 101 H430 M28 152 H430" />
            <path class="diagram-line" d="M28 202 H430" />
            <text class="diagram-text" x="28" y="222">Today</text>
            <text class="diagram-text" x="430" y="222" text-anchor="end">More capable models</text>
          </g>
          <g class="diagram-in">
            <path class="diagram-quiet" d="M28 147 C115 145 171 134 224 109 S338 68 430 60" />
            <path class="diagram-quiet" d="M28 72 C110 76 158 101 220 130 S344 171 430 176" />
            <text class="diagram-text" x="442" y="64">Complexity</text>
            <text class="diagram-text" x="442" y="180">Time and cost</text>
          </g>
          <g class="diagram-in">
            <path class="diagram-emphasis" d="M28 174 C115 171 148 153 208 121 S328 48 430 34" />
            <text class="diagram-label" x="442" y="38">Personalisation</text>
          </g>
        </svg>`

export const STEPS = [
  { label: 'Code', icon: FileCode, color: 'var(--color-fg-muted)' },
  { label: 'Build', icon: Hammer, color: '#ca8a04' },
  { label: 'Image', icon: Layers, color: '#2563eb' },
  { label: 'Container', icon: Box, color: '#0d9488' },
]

// What an agent is, as the TEIS web draws it: the model a box, the harness a larger box round it
// with what it gives the model, between you and your project.
export const HARNESS = {
  you: User,
  model: Brain,
  project: FolderOpen,
  tools: [
    { label: 'Read files', icon: FileCode },
    { label: 'Edit files', icon: FilePen },
    { label: 'Run commands', icon: SquareTerminal },
    { label: 'Instructions', icon: ScrollText },
    { label: 'Permissions', icon: ShieldCheck },
  ],
}

export const HARNESS_TEMPLATE = `
  <div class="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
    <span class="diagram-chip diagram-in justify-center self-center" style="--diagram-color: var(--color-fg-muted)">
      <component :is="harness.you" class="size-4" :stroke-width="1.5" aria-hidden="true" />You
    </span>
    <span class="diagram-in self-center text-fg-faint max-sm:rotate-90" aria-hidden="true">⇄</span>
    <div class="diagram-area diagram-in flex-1" style="--diagram-color: #0d9488">
      <span class="text-sm font-semibold">Harness <span class="font-normal text-fg-muted">· what you give the model</span></span>
      <span class="diagram-chip px-4 py-3" style="--diagram-color: #7c3aed">
        <component :is="harness.model" class="size-5" :stroke-width="1.5" aria-hidden="true" />
        Model <span class="font-normal text-fg-secondary">· thinks</span>
      </span>
      <ul class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm font-medium sm:grid-cols-3">
        <li v-for="tool in harness.tools" :key="tool.label" class="flex items-center gap-2">
          <component :is="tool.icon" class="size-4 shrink-0" :stroke-width="1.5" aria-hidden="true" />{{ tool.label }}
        </li>
      </ul>
    </div>
    <span class="diagram-in self-center text-fg-faint max-sm:rotate-90" aria-hidden="true">⇄</span>
    <span class="diagram-chip diagram-in justify-center self-center" style="--diagram-color: #ca8a04">
      <component :is="harness.project" class="size-4" :stroke-width="1.5" aria-hidden="true" />Your project
    </span>
  </div>`
