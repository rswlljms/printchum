# Contributing to PrintChum

Thank you for contributing to PrintChum. The project is a privacy-first,
browser-based photo layout workspace. Contributions should preserve accurate
physical output, local photo processing, accessibility, and the existing
monochrome interface language.

## Development Setup

Requirements:

- Node.js 20 or newer
- npm 10 or newer
- Chromium for Playwright browser tests

```bash
git clone https://github.com/rswlljms/printchum.git
cd printchum
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000` after the development server starts.

## Quality Checks

Run these checks before opening a pull request:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

The WebMCP execution suite is opt-in because it requires a WebMCP-enabled
Chromium build. The project script enables the browser feature consistently on
Windows, macOS, and Linux:

```bash
npm run test:e2e:webmcp
```

The WebMCP API is experimental. The ordinary E2E suite must continue to pass
and skip WebMCP-only execution cleanly when the browser does not expose
`document.modelContext`.

## Code Conventions

- Use TypeScript with explicit domain types and no avoidable `any` values.
- Keep layout calculations in `lib/layout-engine`; visual components must
  consume its `LayoutResult` rather than implement placement logic.
- Validate untrusted input at boundaries with Zod.
- Keep customer photos in browser memory. Never add photo persistence, upload
  telemetry, test fixtures, snapshots, or logs without explicit approval.
- Keep WebMCP tools in `features/editor/webmcp` and reuse existing editor,
  layout, PDF, and print services.
- Keep tool results compact and free of photo bytes, object URLs, file names,
  crop bitmaps, customer names, and nameplate text. Activity history may store
  only tool name, outcome, and timestamp.
- Use accessible labels, keyboard focus states, semantic landmarks, and reduced
  motion support for UI changes.
- Preserve exact physical dimensions in inches internally and points in PDFs.

## Pull Requests

Pull requests should:

- Explain the user-facing behavior and reason for the change.
- Include focused tests for new or changed behavior.
- State which quality checks were run and whether any were skipped.
- Call out privacy, security, licensing, or dependency implications.
- Avoid unrelated formatting or refactoring changes.
- Never include secrets, customer photos, generated private PDFs, screenshots
  containing personal data, or test traces with private content.

Changes to the WebMCP tool catalog must update the catalog, schema, handler,
registration binding, UI grouping, unit tests, and E2E expectations together.

## License

By contributing, you agree that your contributions are provided under the MIT
License in this repository.
