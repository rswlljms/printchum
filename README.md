# PrintChum

**Your companion for print-ready photos.**

PrintChum is a privacy-first web application for creating accurate, print-ready
ID photo layouts. A user can select local photos, crop them once, assign
multiple physical sizes and quantities, arrange the results across standard or
custom paper, preview every page, and print or download the layout as a PDF.

This repository is currently an open-source browser workspace prototype. The
editor, layout engine, Canvas preview, PDF export, print preview, service sets,
and WebMCP integration are implemented. Authentication, billing, Supabase
persistence, and external background removal are intentionally reserved for a
later release.

Customer photos remain in browser memory during the active session. They are
not uploaded or permanently stored by the current application.

## Current capabilities

- Local JPEG, PNG, and WebP photo selection
- Multiple people in one layout
- Reusable normalized crop, zoom, and rotation settings
- Standard and custom photo sizes with independent quantities
- Letter / Short Bond, Legal (8 × 13 inches), A4, A3, 4R, 5R, and custom paper
- Portrait and landscape paper orientation
- Configurable margins and horizontal and vertical spacing
- Deterministic mixed-size placement and automatic page overflow
- Optional cutting guides, size labels, and nameplates
- Reusable service sets stored in the browser session
- Responsive, high-density Canvas preview driven by `LayoutResult`
- Multi-page PDF download and browser print flow
- Light, dark, and system themes

## Privacy model

PrintChum processes customer photos locally by default:

- Photos are represented as in-memory browser objects and temporary object
  URLs.
- Object URLs are revoked when photos are replaced, removed, or disposed.
- Photos are not saved to local storage, IndexedDB, a database, or cloud
  storage.
- Non-photo workspace configuration may be restored from `sessionStorage`.
- Canvas preview, layout calculation, PDF generation, and printing run in the
  browser.

Do not add customer-photo persistence without explicit product approval.

## Architecture

The framework-independent TypeScript layout engine is the source of placement
truth:

```text
Editor settings
  → normalized measurements in inches
  → calculateLayout()
  → LayoutResult
  → Canvas preview, PDF export, print preview, and summary
```

This keeps page count, item positions, margins, spacing, rotation, overflow,
and physical output deterministic across every renderer.

## Tech stack

### Application

- Next.js App Router
- React
- TypeScript
- Zustand

### Interface

- Tailwind CSS
- Radix UI primitives
- Lucide React
- Geist font family
- `react-easy-crop`

### Validation and forms

- React Hook Form
- Zod
- `@hookform/resolvers`

### Layout and output

- Framework-independent custom TypeScript layout engine
- Browser Canvas API
- `pdf-lib`
- Browser print APIs and print-specific CSS

### Quality and deployment

- Vitest
- Playwright
- ESLint
- Vercel

## Getting started

### Requirements

- Node.js 20 or newer
- npm

### Install and run

```bash
cp .env.example .env.local
npm ci
npm run typecheck
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the PrintChum
workspace.

## Available commands

```bash
npm run dev        # Start the local development server
npm run typecheck  # Check TypeScript
npm run lint       # Run ESLint
npm test           # Run Vitest once
npm run test:watch # Run Vitest in watch mode
npm run test:e2e   # Run Playwright end-to-end tests
npm run build      # Create a production build
npm start          # Start the production server
```

Run the optional WebMCP execution test against a compatible Chromium build:

```bash
npm run test:e2e:webmcp
```

Playwright starts or reuses the local Next.js development server at
`http://localhost:3000`.

## Project structure

```text
app/                  Next.js routes, layouts, and global styles
components/editor/    Editor panels and controls
components/print/     Browser print preview
components/ui/        Shared interface primitives
features/editor/      Editor types, validation, and session behavior
lib/layout-engine/    Framework-independent layout calculation
lib/canvas/           Canvas rendering
lib/paper/            Paper presets, units, and printable-area rules
lib/pdf/              PDF rendering and download
lib/print/            Direct-print coordination
lib/service-sets/     Reusable package definitions
stores/               Zustand editor state
tests/                Vitest and Playwright coverage
```

## WebMCP Integration

PrintChum uses the browser-native WebMCP API as a progressive enhancement. It
does not run an MCP server, expose a JSON-RPC endpoint, or send customer photos
to an agent. Tools exist only while the editor is mounted in a compatible,
secure browser context.

The registration boundary uses `document.modelContext.registerTool` with one
abort signal for the editor lifecycle:

```ts
const controller = new AbortController();

for (const tool of createEditorToolRegistrations()) {
  await document.modelContext?.registerTool(tool, {
    signal: controller.signal,
  });
}

// Abort on editor unmount. The browser unregisters the scoped tools.
controller.abort();
```

The current catalog contains 17 tools:

- Five read-only inspection tools for summaries and preset lists
- Ten write tools for paper, photo sizes, service sets, nameplates, pages,
  backgrounds, and crop mode
- Two execute tools for PDF download and opening the human-confirmed print
  dialog

Registration is feature-detected. Unsupported browsers, an explicit
`NEXT_PUBLIC_WEBMCP_ENABLED=false` kill switch, Permissions Policy blocks, and
partial registration failures leave the ordinary editor workflow functional.
The response header keeps same-origin registration explicit with
`tools=(self)`.

WebMCP references:

- [WebMCP specification](https://webmachinelearning.github.io/webmcp)
- [Chrome imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api)
- [Chrome security guidance](https://developer.chrome.com/docs/ai/webmcp/secure-tools)

Tool arguments and results are validated and compact. Results never contain
photo bytes, object URLs, source file names, crop bitmaps, or nameplate text.
The in-memory activity list stores only tool name, outcome, and timestamp; it
does not retain tool arguments or results.

## Deployment

PrintChum is configured for Vercel's native Next.js integration.

1. Import the repository into Vercel.
2. Keep the detected framework preset as **Next.js**.
3. Use `npm run build` as the build command.
4. Deploy the production branch.

Vercel automatically creates preview deployments for branches and pull
requests and updates production when the configured production branch receives
a new commit.

For local configuration, copy `.env.example` to `.env.local`. Keep real
credentials in the local ignored file or Vercel encrypted environment
variables. No provider credentials are required for the current browser-only
workspace.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, coding conventions, testing,
privacy requirements, and pull request expectations. Security reports should
follow [SECURITY.md](SECURITY.md). This project is released under the
[MIT License](LICENSE).

## Product status

The current repository focuses on the browser-based PrintChum workspace.
Authentication, billing, Supabase persistence, and external background removal
are not connected yet. Customer-photo persistence remains intentionally out of
scope.
