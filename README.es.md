<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.png" />
    <img src="assets/logo.png" alt="elastic-ui" width="104" />
  </picture>
</p>

<h1 align="center">elastic-ui</h1>

<p align="center">
  <strong>elastic-ui convierte las piezas de una interfaz Vue en cosas que se transforman en su sitio: un botón se hace su diálogo, una tarjeta se abre en su detalle.</strong>
</p>

<p align="center">
  Para proyectos con Vue 3. Hecha para los míos y compartida tal cual.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@joseestevez/vue-elastic-ui"><img src="https://img.shields.io/badge/npm-vue--elastic--ui-cb3837?style=flat-square&logo=npm&logoColor=white" alt="elastic-ui en npm"></a>
  <a href="packages/elastic-ui/USAGE.md"><img src="https://img.shields.io/badge/Docs-Leer-2563eb?style=flat-square&logo=readthedocs&logoColor=white" alt="Documentación de elastic-ui"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/Licencia-MIT-0f172a?style=flat-square&logo=opensourceinitiative&logoColor=white" alt="Licencia MIT"></a>
</p>

<p align="center">
  <a href="#en-local">En local</a> ·
  <a href="README.md">English</a>
</p>

<p align="center">
  <img src="assets/readme/chat-morph.gif" alt="Un botón se convierte en un panel de chat sobre una aurora suave; la pregunta que se escribe sube hasta la conversación" width="100%">
</p>

## ¿Qué es elastic-ui?

La mayoría de las interfaces cortan: un diálogo aparece, una pestaña cambia, una lista se
reordena en un solo fotograma. El ojo tiene que averiguar qué ha cambiado.

elastic-ui mantiene la continuidad. El botón crece hasta ser su diálogo, el indicador de la
pestaña viaja a la siguiente, una respuesta fluye hacia dentro. El movimiento explica qué ha
cambiado en vez de decorar, y en cada pantalla manda un solo movimiento. Es una librería de Vue 3
construida sobre Tailwind CSS v4, [Reka UI](https://reka-ui.com) y
[motion-v](https://motion.dev/docs/vue).

## Cómo funciona

Cada pieza está hecha para transformarse en su sitio, y el comportamiento (foco, teclado, ARIA)
viene de Reka UI.

| En vez de | La pieza hace |
|---|---|
| un diálogo que aparece | `DialogMorph`: la caja del botón viaja al centro de la pantalla y crece hasta ser el diálogo, y se pliega de vuelta al cerrar |
| una etiqueta que se cambia | `TextMorph`: las letras que comparten los dos textos vuelan a su nuevo sitio |
| una lista que salta | `AnimatedList`: cada elemento encuentra su nuevo sitio cuando la lista se filtra, se ordena o cambia |
| un indicador de pestaña que salta | `Tabs`: el indicador viaja a la pestaña siguiente |

Cada pieza tiene sus stories y una por cada situación que importa. Las reglas están en
[DECISIONS.md](packages/elastic-ui/DECISIONS.md) (en inglés).

## Qué puedes hacer hoy

- **Abrir** diálogos, popovers y tarjetas desde el elemento que los dispara: `DialogMorph`,
  `PopoverMorph`, `ExpandableCard`.
- **Escribir** mensajes cortos en un formulario que crece desde un botón (`ComposeMorph`) y
  hablar con un asistente (`ChatMorph`).
- **Reproducir** sesiones de agentes y comandos de terminal paso a paso: `AgentReplay`,
  `TerminalReplay`.
- **Mostrar** datos y estructura con `Chart`, `Diagram`, `Table` y `Timetable`.
- **Construir** formularios, navegación y superposiciones con unas sesenta piezas públicas en
  nueve familias.
- **Explorar** cada pieza en vivo en el sitio y en Storybook.

<h2 align="center">Mira elastic-ui en acción</h2>

<p align="center">
  <a href="assets/readme/dynamic-island.mp4"><img src="assets/readme/dynamic-island.gif" alt="Una píldora negra cambia de forma para música, un temporizador, una subida y una llamada" width="100%"></a>
</p>

<p align="center"><sub><code>DynamicIsland</code>: una píldora que toma la forma de lo que muestra.</sub></p>

## En local

```bash
npm install
npm run storybook   # http://localhost:6006
npm run site        # el sitio en http://localhost:5173
```

Los comandos de la raíz delegan en los paquetes:

```bash
npm run build           # compila la librería
npm run build-storybook # Storybook estático
npm run typecheck       # librería y sitio
npm run site:build      # sitio estático
```

Para usar la librería en un proyecto, instálala desde npm y sigue el
[README del paquete](packages/elastic-ui/README.es.md):

```bash
npm install @joseestevez/vue-elastic-ui motion-v
```

## Documentación

La documentación está en inglés.

- [Usar elastic-ui](packages/elastic-ui/USAGE.md): las reglas para construir con ella, para personas y para agentes de código.
- [Decisiones de diseño](packages/elastic-ui/DECISIONS.md): cómo está hecha y por qué.
- [Roadmap](ROADMAP.md): dónde está y qué viene.
- [AGENTS.md](AGENTS.md): convenciones de trabajo de este repo.

## Ecosistema

[Kolmi](https://github.com/JoseEstevez520/Kolmi) está hecho con elastic-ui. Es un proyecto
aparte y elastic-ui no depende de él.

## Licencia

elastic-ui es de código abierto bajo la [licencia MIT](LICENSE). Los problemas de seguridad se
comunican según [SECURITY.md](SECURITY.md), nunca en una issue pública.
