# PrintChum

**Your companion for print-ready photos.**

PrintChum is a privacy-first web application for creating accurate, print-ready
ID photo layouts. A user can select local photos, crop them once, assign
multiple physical sizes and quantities, arrange the results across standard or
custom paper, preview every page, and print or download the layout as a PDF.

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
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects
to the PrintChum editor.

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

## Deployment

PrintChum is configured for Vercel's native Next.js integration.

1. Import the repository into Vercel.
2. Keep the detected framework preset as **Next.js**.
3. Use `npm run build` as the build command.
4. Deploy the production branch.

Vercel automatically creates preview deployments for branches and pull
requests and updates production when the configured production branch receives
a new commit.

## Product status

The current repository focuses on the browser-based PrintChum workspace.
Authentication, billing, Supabase persistence, and external background removal
are not connected yet. Customer-photo persistence remains intentionally out of
scope.
