// The diagram classes of tokens.css (USAGE 10) as plain CSS, for a document that has no Tailwind of
// its own: an SVG shown as an image (DiagramImage), a sandboxed frame (SandboxFrame). Kept in step
// with the utilities there.
export const diagramSheet = `
.diagram { overflow: visible; font-family: var(--font-sans); font-size: 12px; fill: var(--color-fg-secondary); }
.diagram-part { fill: color-mix(in oklab, var(--diagram-color, var(--color-accent)) 14%, var(--color-bg)); stroke: none; rx: var(--radius-md); ry: var(--radius-md); }
.diagram-label { fill: color-mix(in oklab, var(--diagram-color, var(--color-accent)) 75%, var(--color-fg)); font-size: 13px; font-weight: 600; }
.diagram-text { fill: var(--color-fg-secondary); font-size: 12px; }
.diagram-line { fill: none; stroke: var(--color-border-strong); stroke-width: 1; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.diagram-quiet { fill: none; stroke: var(--color-fg-faint); stroke-width: 1; stroke-dasharray: 4 4; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.diagram-emphasis { fill: none; stroke: var(--diagram-color, var(--color-accent)); stroke-width: 2.75; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.diagram-grid { fill: none; stroke: var(--color-border); stroke-width: 0.75; stroke-dasharray: 2 6; vector-effect: non-scaling-stroke; }
.diagram-area { display: flex; flex-direction: column; gap: 0.75rem; padding: 0.9rem 1rem 1rem; border-radius: var(--radius-xl); background: color-mix(in oklab, var(--diagram-color, var(--color-accent)) 10%, var(--color-bg)); color: color-mix(in oklab, var(--diagram-color, var(--color-accent)) 75%, var(--color-fg)); }
.diagram-chip { display: inline-flex; align-items: center; gap: 0.4em; padding: 0.45em 0.75em; border-radius: var(--radius-md); background: color-mix(in oklab, var(--diagram-color, var(--color-accent)) 14%, var(--color-bg)); color: color-mix(in oklab, var(--diagram-color, var(--color-accent)) 75%, var(--color-fg)); font-size: 0.875rem; font-weight: 600; }
`
