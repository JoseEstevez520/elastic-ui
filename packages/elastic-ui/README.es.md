<p align="center">
  <img src="https://raw.githubusercontent.com/JoseEstevez520/elastic-ui/main/assets/logo.png" alt="elastic-ui" width="104" />
</p>

# elastic-ui

[English](./README.md)

Una librería de componentes de Vue 3 donde las cosas se transforman en vez de aparecer: un botón crece hasta ser su diálogo, el indicador de una pestaña viaja a la siguiente, una respuesta fluye como una ola. Limpia, suave y tranquila, con un solo movimiento al mando en cada pantalla.

Construida sobre Vue 3, Tailwind CSS v4, [Reka UI](https://reka-ui.com) y [motion-v](https://motion.dev/docs/vue).

<p align="center">
  <img src="https://raw.githubusercontent.com/JoseEstevez520/elastic-ui/main/assets/readme/chat-morph.gif" alt="Un botón se convierte en un panel de chat sobre una aurora suave; la pregunta que se escribe sube hasta la conversación" width="560" />
</p>

## Míralo moverse

<table>
  <tr>
    <td width="50%"><img src="https://raw.githubusercontent.com/JoseEstevez520/elastic-ui/main/assets/readme/compose-morph.gif" alt="Un botón Comment crece hasta ser un pequeño formulario, envía y se pliega de vuelta" /></td>
    <td width="50%"><img src="https://raw.githubusercontent.com/JoseEstevez520/elastic-ui/main/assets/readme/dialog-morph.gif" alt="Un botón Delete viaja al centro de la pantalla y crece hasta ser su diálogo" /></td>
  </tr>
  <tr>
    <td align="center"><sub><code>ComposeMorph</code>: un botón que se convierte en formulario.</sub></td>
    <td align="center"><sub><code>DialogMorph</code>: el botón se convierte en el diálogo.</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="https://raw.githubusercontent.com/JoseEstevez520/elastic-ui/main/assets/readme/dynamic-island.gif" alt="Una píldora negra cambia de forma para música, un temporizador, una subida y una llamada" /></td>
    <td width="50%"><img src="https://raw.githubusercontent.com/JoseEstevez520/elastic-ui/main/assets/readme/agent-replay.gif" alt="Una sesión de agente grabada que se reproduce paso a paso junto a su explicación" /></td>
  </tr>
  <tr>
    <td align="center"><sub><code>DynamicIsland</code>: una píldora que toma la forma de lo que muestra.</sub></td>
    <td align="center"><sub><code>AgentReplay</code>: una sesión de agente que puedes recorrer paso a paso.</sub></td>
  </tr>
</table>

## Qué trae

| Familia | Piezas |
|---|---|
| Actions | Button, CopyButton, ProgressButton, ThemeToggle, ComposeMorph |
| Forms | Input, Textarea, Select, Checkbox, Switch, Filters |
| Overlays | Popover, PopoverMorph, Menu, Tooltip, DialogMorph, CommandPalette, Toast, SelectionMenu |
| Disclosure | Collapsible, Accordion, Tabs, Steps, ExpandableCard |
| Navigation | Sidebar, NavTree, MorphHeader, Breadcrumbs, TableOfContents, SearchMorph, ScrollIndicator |
| Content | Card, Badge, Callout, AnimatedList, DynamicIsland |
| Text | TextMorph, StatusText, TruncatedText, Prose, Markdown |
| Code | CodeBlock, CodeDiff, CodeWalkthrough, TerminalReplay |
| AI | Chat, ChatMorph, ChatProposal, Aurora, AgentReplay, ImageReveal |

## Instalar

Publicada en npm como [`@joseestevez/vue-elastic-ui`](https://www.npmjs.com/package/@joseestevez/vue-elastic-ui):

```bash
npm install @joseestevez/vue-elastic-ui motion-v
```

`motion-v` viene con ella porque es una dependencia par; Vue y Tailwind CSS v4 se esperan en el proyecto.

La librería no incluye CSS compilado: el Tailwind del proyecto genera sus clases. En su hoja de estilos principal:

```css
@import "tailwindcss";
@import "@joseestevez/vue-elastic-ui/tokens.css";
@source "../node_modules/@joseestevez/vue-elastic-ui/dist";
```

Después, usa las piezas:

```vue
<script setup>
import { Button, PopoverMorph, PopoverMorphItem } from '@joseestevez/vue-elastic-ui'
import { Pencil, Trash2 } from '@lucide/vue'
</script>

<template>
  <PopoverMorph role="menu" label="Actions">
    <template #trigger>Actions</template>
    <PopoverMorphItem :icon="Pencil">Rename</PopoverMorphItem>
    <PopoverMorphItem :icon="Trash2">Delete</PopoverMorphItem>
  </PopoverMorph>
</template>
```

## En tu idioma

Todos los textos que escribe la librería por su cuenta (nombres para lectores de pantalla, placeholders, títulos por defecto) se pueden fijar una vez:

```js
import { ElasticUi } from '@joseestevez/vue-elastic-ui'

app.use(ElasticUi, { labels: { copy: 'Copiar', onThisPage: 'En esta página' } })
```

## Temas

Cada color mantiene los dos temas con `light-dark()`, así que el tema sigue al sistema. `data-theme="light"` o `"dark"` en `<html>` fuerza uno, y ThemeToggle lo cambia. La personalización va de fuera hacia dentro: tokens globales en `:root` (`--color-accent`, `--radius-md`…), después los tokens propios de una pieza (`--card-radius`, `--popover-bg`…), después las variantes y por último `class`.

## Usarla bien

La documentación está en inglés.

- [`USAGE.md`](./USAGE.md): las reglas para construir con ella, para personas y para agentes de código.
- [`DECISIONS.md`](./DECISIONS.md): cómo está hecha y por qué.
- `npm run storybook`: cada pieza, por familia, en cada situación que importa.

## Licencia

MIT.
