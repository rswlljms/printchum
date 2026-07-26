---
name: bryl-minimal-design
description: Apply the bryl-minimal design language — a monochrome, typography-driven minimal aesthetic with halftone dot textures, pixel-font display headings, tiny uppercase monospace labels, soft large-radius cards, and full light/dark theming. Use this whenever building or restyling any web UI (portfolio, landing page, blog, dashboard, docs site, app screen, component) where the user wants a clean, minimal, monochrome, editorial, or terminal-inspired look — or whenever they mention "bryl-minimal", "my design system", or ask for something that "looks like bryllim.com". Works with any stack (plain HTML/CSS, Tailwind, React, Vue, etc.) — it describes the aesthetic in values, not code.
---

# bryl-minimal design language

A monochrome, typography-first aesthetic: true black on white, no accent color, texture from halftone dots instead of color, hierarchy from font choice instead of size extremes, and restrained but deliberate motion. It should feel like a well-set technical zine — quiet, precise, slightly playful.

This spec is technology-agnostic. Every rule is given as values and intent; implement it with whatever the project already uses (vanilla CSS, Tailwind, CSS-in-JS, a native toolkit's web view — anything). Never bolt on a new framework just to satisfy this skill.

## Philosophy — read this first

Three decisions drive everything else:

1. **No accent color.** Emphasis comes from inversion (black chip on white page, white text in black pill), from typography (switching to the pixel or mono font), and from texture (halftone dots). If you feel the urge to reach for blue or green, invert instead.
2. **Type does the talking.** Four font roles with sharply different personalities carry the hierarchy. Sizes stay modest; contrast comes from *which* font is used, its casing, and its tracking.
3. **Whitespace is structure.** Content lives in a narrow measure with generous vertical rhythm. Sections are separated by hairline rules and numbered labels, not by boxes or background tints.

## Color

The palette is strictly monochrome: a background, an ink, and a nine-step gray ramp between them. Both themes use the *same* semantic roles; dark mode is a re-mapping, not a redesign.

| Role | Light theme | Dark theme |
|---|---|---|
| Background | pure white `#ffffff` | near-black with a blue cast `#0c0c0f` |
| Ink (foreground) | true black `#0a0a0a` | off-white `#f4f4f5` |
| Gray 50 (faintest fill) | `#fafafa` | `#18181b` |
| Gray 100 (subtle fill) | `#f5f5f5` | `#1e1e22` |
| Gray 200 (hairlines, borders) | `#e9e9e9` | `#2a2a30` |
| Gray 300 (strong borders, scrollbar) | `#d4d4d4` | `#3a3a42` |
| Gray 400 (faint text, labels) | `#a3a3a3` | `#8a8a92` |
| Gray 500 (muted text) | `#737373` | `#a0a0a8` |
| Gray 600–950 | progressively darker grays toward ink | progressively lighter grays toward ink |

Usage rules:

- Body text is ink; secondary text is gray 500; tertiary/meta text is gray 400. Never go lighter than gray 400 for anything that must be read.
- Borders and dividers are gray 200 at one-pixel weight. Dividers are hairlines (1px lines), used generously to separate sections and grid cells.
- Filled surfaces are rare. When a card needs a fill, use gray 50 or a barely-there gradient from gray 50 down to the background.
- The one "loud" element allowed per view is an inverted chip: ink background, background-colored text (e.g. a featured badge). Use sparingly — it reads as the highest emphasis on the page.
- Text selection inverts: ink background, background-colored text.

**Theming mechanics (adapt to the stack):** store colors as semantic tokens (background, ink, gray-50…gray-950) that are swapped wholesale when a `dark` class or attribute is set on the document root, honoring three user choices: light, dark, and system (following the OS preference). If the platform supports storing color tokens as raw RGB channels so alpha can be applied at point of use, do that. Theme changes crossfade over half a second on background, text, and border colors. Persist the choice; default to system.

## Typography

Four fonts, four jobs. All are free and openly licensed:

| Role | Font | Fallbacks | Used for |
|---|---|---|---|
| Body/UI | **Geist** | system-ui, sans-serif | paragraphs, navigation, card titles, buttons |
| Technical | **Geist Mono** | ui-monospace, monospace | labels, timestamps, tags, footer links, nav items |
| Display | **Geist Pixel** (Square) | Geist Mono, monospace | page titles, section number labels, big stat values |
| Long-form | **Source Serif 4** | Georgia, serif | article/blog body text only |

Geist and Geist Mono load from Google Fonts; Source Serif 4 too. Geist Pixel is Vercel's pixel variant (available via its GitHub releases / CDN as a woff2). Always load fonts with swap behavior so text renders immediately. If Geist Pixel is unavailable in some environment, fall back to Geist Mono in uppercase — never substitute a decorative font.

The scale is compact — base UI text is 15px, not 16:

- Page title (pixel font): about 3rem, line-height 1, lowercase, usually a single word ("blog", "projects").
- Article headings (serif or sans, weight 600, letter-spacing −0.02em): h1 ≈ 1.6rem, h2 ≈ 1.3rem, h3 ≈ 1.1rem.
- Long-form body: 1.0625rem (17px) serif with a roomy 1.75 line-height.
- UI body: 15px sans; small text 13px.
- Micro-labels: 9–11px mono, UPPERCASE, letter-spacing about +1px (wide tracking), gray 400/500. This is the aesthetic's signature register — timestamps, tags, section markers, button captions all live here.

Section headers follow a numbered, em-dashed convention set in the display font at small size and gray 400: "01 — blog", "02 — projects". Page titles and most standalone labels are lowercase; only mono micro-labels are uppercase. Links are underlined with the underline drawn at 25% opacity of the text color, offset ~2px below baseline, rising to full opacity on hover. External links get a trailing "↗".

## Layout & spacing

- Content column: narrow — 42rem (672px) max for reading pages; up to 56rem (896px) only when a page genuinely needs multi-column grids.
- Navigation is a fixed left sidebar, 14rem wide, appearing at ≥1024px viewports; content shifts right to clear it. Below that, a sticky top bar (hairline bottom border, ~90%-opaque background with background blur) with a full-screen overlay menu.
- Horizontal page padding: 1rem on mobile, 1.5rem on desktop. Card padding: 1.25rem. Vertical rhythm between sections: large — 3.5rem block spacing. Small gaps inside components: 0.75rem; between grid cards: 0.75–1.5rem.
- Grids are modest: 2 columns on small screens, 3 at ≥1024px. Stat rows divide cells with hairline rules (both axes) instead of gaps — the dividers *are* the design.
- Sidebar groups separate with 1px gray-200 rules; the active nav item is ink-colored with a small leading arrow, inactive items are gray and darken to ink on hover.

## Components

Every component follows the same recipe: hairline gray-200 border, generous radius, near-white fill, soft low-alpha shadow, mono micro-label somewhere.

- **Radii:** large cards 16px; medium cards 12px; small elements 8px; inputs/minimal 6px; pills and badges fully rounded. Thumbnails ~10px.
- **Shadows** are always black at low alpha with large blur and strong negative spread, so they read as soft ground contact, not material elevation. Resting card: roughly "8px down, 22px blur, −14px spread, 25% black". Hover: deepen to roughly "18px down, 36px blur, −20px spread, 40% black" while the card lifts 2px. Modal panels go much deeper (≈"40px down, 90px blur, −20px spread, 35% black"). In dark mode shadows nearly disappear — rely on borders.
- **Tags/pills:** fully-rounded, hairline gray-300 border, 9px uppercase mono, gray 500, tight padding (~2px vertical, 8px horizontal). The featured/champion variant inverts: ink fill, background-colored text, no border.
- **Buttons:** understated. Primary action: ink fill, background-colored text, 6–8px radius, 12px text, darkening slightly on hover. Most "buttons" are really mono text links with an arrow glyph that nudges up-and-right on hover.
- **Cards:** border + radius + white/gray-50 fill + soft shadow, optionally an inset hairline border 5px inside the edge as a framing accent. Images inside zoom to 1.04 scale over half a second on hover.
- **Inputs:** either invisible (transparent, borderless, mono text, no focus ring beyond caret) inside composed widgets, or minimal: gray-50 fill, gray-200 border, 6px radius, 13px mono text.
- **Modals:** full-viewport overlay, ink at 30% opacity with a strong background blur; a centered panel (max width ~24rem, 16px radius, 1.75rem padding) that fades and scales from 95% to 100% over 200ms. Escape closes.
- **Scrollbars:** slim — 6px, transparent track, gray-300 rounded thumb.

## Texture — the halftone motif

The signature flourish: fields of tiny round dots (a print-style halftone), monochrome, used as page backdrops, section accents, and photo treatments.

- Construction: a repeating grid of 1px-radius dots on a ~9px cell (denser variants at 6px and 5px cells). Light theme: near-black dots at 90% alpha. Dark theme: off-white dots at ~42% alpha.
- Always fade the field out with a soft mask (radial or linear) so it dissolves at the edges rather than ending abruptly — into a corner, under a heading, or along the bottom edge of a photo so the image appears to dissolve into dots.
- Use it in at most one or two places per page. It is seasoning, not wallpaper.

## Motion

Motion is brief, eased, and one-directional (things settle downward-up, never bounce):

- Micro-interactions (color, opacity, small transforms): 200ms.
- Card hovers: ~350ms for shadows, ~420ms for transforms, on a strong ease-out curve (fast start, long gentle landing — cubic-bezier(0.16, 1, 0.3, 1) or similar).
- Page entrance: elements fade up from 12px below over 700ms on that same curve, staggered ~70ms apart down the page (first at 50ms, each subsequent later, capped around 330ms).
- Status dots pulse by opacity (1 → 0.25 → 1) on a slow 1.8s loop.
- Theme switching crossfades colors over 500ms; if the platform offers view transitions, a circular reveal expanding from the click point over ~540ms is the ideal.
- Always disable all of this under a reduced-motion preference — the design must be complete when perfectly still.

## Accessibility & quality bar

Non-negotiables that keep the minimalism honest: semantic landmarks (nav/main/header/article); readable contrast (the ramp guarantees it if you respect the "nothing lighter than gray 400 for text" rule); keyboard escape routes for every overlay; honoring both `prefers-color-scheme` and `prefers-reduced-motion`; and declaring support for both color schemes to the browser so form controls and scrollbars match the theme.

## Applying this to an existing project

When restyling something that already exists: keep its structure and stack, then work in this order — (1) collapse the palette to the monochrome ramp, (2) install the four font roles and re-cast labels into the mono micro-label register, (3) thin every border to a gray-200 hairline and align radii to the 16/12/8/6 ladder, (4) soften shadows to the low-alpha recipe, (5) add dark mode via token re-mapping, (6) add the entrance stagger, (7) finish with one tasteful halftone accent. Stop before it gets busy: if a screen feels empty, that is usually correct.
