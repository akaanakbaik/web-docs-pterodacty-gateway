# Pterodactyl Gateway Docs: Field Manual

Reading this as: technical documentation for backend developers and panel operators, in a field-manual visual language, with dial ENERGY 2 / RHYTHM 3 / MOTION 2.

## Product character

This is a working manual, not a marketing site. The reader arrives with a panel, a key, and a task. The interface should feel like a well-kept operations binder: dense where the work is dense, quiet where reading needs room, and unambiguous about what is current.

The identity motif is the chapter index. Every page, section, and navigation group carries a number or a short label that helps the reader locate themselves. The motif is functional first. It is not a background pattern.

## Palette

Core colors: bone, ink, and signal green. Signal green is the only accent.

Light theme:

- Canvas: `#F3F1E8`
- Surface: `#FBFAF4`
- Ink: `#141612`
- Muted: `#5C6157`
- Line: `#D5D2C5`
- Strong line: `#7A7E70`
- Signal: `#B9E36A`
- Signal ink: `#141612`

Dark theme:

- Canvas: `#111310`
- Surface: `#171A15`
- Ink: `#EEF1E6`
- Muted: `#A9B0A3`
- Line: `#30362C`
- Strong line: `#6D756A`
- Signal: `#C8F27A`
- Signal ink: `#111310`

Reason: bone and ink make long documentation comfortable to read. Signal green marks the active path and primary action, so it stays scarce. Both themes are shipped because developers read in different environments.

## Typography

- Display and headings: Bricolage Grotesque. It has an editorial, slightly mechanical voice that suits a field manual without looking like a generic SaaS page.
- Body: IBM Plex Sans. It holds up at small sizes and has a technical lineage without becoming a costume.
- Code and labels: IBM Plex Mono. Monospace is reserved for commands, versions, and small operational labels where alignment matters.

Type scale is fluid. Headings use tight tracking and short line lengths. Body text stays between 16px and 18px with a line height near 1.7.

## Layout

Desktop uses three columns: a navigation rail, a reading column, and a context rail. The reading column is the focal point. The navigation rail is compact and persistent. The context rail carries the current page index and release facts.

Tablet collapses to two columns with the navigation rail moved into a drawer. Mobile becomes one column with a compact sticky header and a full-height navigation sheet.

The homepage uses a split hero with a release ledger, followed by three task paths and a documentation index. It does not use a bento grid, a testimonials section, a logo bar, or a pricing table.

Documentation pages use a single article with numbered steps, a command runner, code examples, and previous/next navigation. The right rail shows the page index and the current release.

## Components

- Surfaces are flat. Borders carry hierarchy; shadows are reserved for overlays.
- Radius scale: 2px for labels, 8px for controls, 12px for panels.
- Buttons are at least 44px tall. Primary actions use the signal fill; secondary actions use a line border.
- Pills appear only as functional status labels, never as decorative badges above headings.
- Icons are functional and always paired with a text label or accessible name.
- Code blocks use an ink surface in both themes and keep horizontal scrolling inside the block.
- The component layer uses shadcn-style Radix primitives: Dialog for the palette, assistant, and mobile sheet; Tabs for command scenarios; Tooltip for icon controls; Progress for the simulation; Badge, Button, and Skeleton for feedback states.
- A compact specification strip below the header states the SDK version, runtime, panel support, and license. It is real package metadata, not decoration.
- A static boot skeleton in `index.html` paints the header, rails, and reading column before the React bundle arrives. The assistant uses the shadcn Skeleton for reply loading.
- The AI assistant is a side panel on desktop and a full-height sheet on mobile. It opens from a labeled button.

## Motion

MOTION 2: hover and focus states, a short route transition, and a deliberate command-runner simulation. The runner types the command with a slow, variable cadence, pauses while the CLI works, then reveals output line by line. It starts when the runner enters the viewport, can be replayed, skipped, and becomes instant under `prefers-reduced-motion`. No floating objects, no endless pulses, no scroll-reveal on every element.

## Texture

A fine paper grain sits under the canvas at low opacity so the bone surface reads as a manual rather than a flat digital panel. The grain is static and repeats from a small inline SVG, so it costs one paint and no network request. Rules, registration marks, and the numbered index remain the primary structure.

## Copy

Voice: direct, operational, and specific. Indonesian is the primary language. Commands and package names stay verbatim. No em dashes, no invented numbers, no testimonials, no claims that cannot be traced to the package or the documentation.

## Accessibility

Both themes meet WCAG AA for body text and 3:1 for interactive boundaries. Every control has a visible focus ring, a native element, and an accessible name. The command palette and assistant close with Escape. A skip link is the first focusable element. Motion respects `prefers-reduced-motion`.

## Anti-slop decisions

- No grid or blueprint background. Structure comes from columns and rules.
- No glassmorphism. The page stays solid so text keeps its contrast.
- No radial orbs or glow. The accent is a fill, not a light source.
- No decorative terminal chrome. The command runner is a real CLI transcript for a real CLI, labeled as a simulation and never presented as a live panel response.
- No decorative arrows. The one arrow in the primary CTA points to the next step in the manual.
- No stock illustrations. The product has no suitable original image, so the layout uses typography and real package facts.
