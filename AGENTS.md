# AGENTS.md

## Project Identity

- **Product name:** PrintChum
- **Brand capitalization:** `PrintChum`
- **Primary domain:** `printchum.com` when available and registered
- **Product category:** Privacy-first photo layout and printing SaaS
- **Primary tagline:** Your companion for print-ready photos.

Use **PrintChum** consistently in user-facing copy, metadata, documentation, emails, billing descriptions, and product labels. Do not use temporary names such as `photo-print-saas`, `EZPrint`, `PrintQuick`, or `Printoria` in user-facing content.

Internal package names, environment variables, and technical identifiers may use lowercase kebab case or snake case where required, such as `printchum` or `printchum-app`.

## Project Overview

PrintChum is a privacy-first SaaS web application for creating print-ready ID photo layouts.

Users can upload a photo once, crop and position it, generate multiple photo sizes, arrange them on standard or custom paper, apply optional nameplates, remove or replace backgrounds, and either download a PDF or print directly.

PrintChum is intended for:

- Individual users
- Freelance photo editors
- Home-based printing businesses
- Photo studios
- Computer shops
- Schools and organizations
- Multi-branch printing businesses in later versions

The first release is online-first. Offline functionality may be added later, but the architecture must not prevent it.

---

# 1. Core Product Principles

All implementation decisions must follow these principles.

## 1.1 Privacy First

Customer photos must not be permanently stored by default.

The default flow is:

1. User selects a local image.
2. The image remains in browser memory.
3. Cropping, layout generation, background color changes, PDF generation, and printing happen locally whenever possible.
4. The image is sent to the backend only when background removal is explicitly requested.
5. The backend sends the image to the configured background-removal provider.
6. The processed image is returned to the browser.
7. Neither the original image nor the processed image is written to Supabase Storage.
8. Temporary browser object URLs and in-memory buffers are cleaned up when no longer needed.

Do not add photo persistence without explicit product approval.

Do not create database columns such as:

- `original_photo_url`
- `processed_photo_url`
- `customer_photo_path`
- `pdf_export_url`

Saved projects may store layout configuration, but not customer images.

## 1.2 Local Processing by Default

Perform these operations in the browser:

- File selection
- Photo cropping
- Zooming
- Rotation
- Background color composition
- Layout generation
- Page preview
- Nameplate rendering
- PDF generation
- Print rendering

Use the backend only for operations that require secrets, billing, external APIs, or authoritative permission checks.

## 1.3 Accurate Physical Output

The application must preserve real-world dimensions.

Use these conversion rules:

```ts
const MM_PER_INCH = 25.4;
const CM_PER_INCH = 2.54;
const PDF_POINTS_PER_INCH = 72;
const PRINT_PIXELS_PER_INCH = 300;
```

The preview may use a custom screen scale, but the PDF must use exact physical dimensions.

Do not use DOM screenshots as the primary PDF-generation method.

## 1.4 One Source of Truth

The same layout result must drive:

- Canvas preview
- PDF export
- Direct print
- Page count
- Paper utilization
- Cutting guides
- Size labels
- Nameplate positions

Do not maintain separate placement logic for preview and export.

## 1.5 Solo-Developer Simplicity

Prefer the simplest architecture that safely supports the product.

Do not introduce:

- Microservices
- Redis
- Message queues
- Kubernetes
- Docker orchestration
- A separate Express backend
- A separate marketing repository
- A separate desktop application

unless the current system has a verified requirement for them.

---

# 2. Required Technology Stack

Use the following stack unless an approved architectural decision replaces a specific part.

## Application

- Next.js App Router
- TypeScript
- React
- Node.js runtime where required

## UI

- Tailwind CSS
- shadcn/ui
- Lucide React

## State and Forms

- Zustand for editor state
- React Hook Form for forms
- Zod for validation

## Backend and Data

- Supabase PostgreSQL
- Supabase Auth
- Supabase Row Level Security
- Supabase Storage only for non-customer-photo assets when necessary

## Image and Layout

- `react-easy-crop`
- Browser Canvas API
- Custom TypeScript layout engine

## PDF and Printing

- `pdf-lib`
- Browser print dialog
- Print-specific CSS

## External Services

- PhotoRoom Remove Background API
- Polar (Merchant of Record billing)
- Vercel
- Sentry when production monitoring is added

## Deployment

- Deploy the Next.js application to **Vercel** using its native Next.js
  integration.
- Do not add platform adapters or deployment runtimes unless a verified
  application requirement cannot be met by Vercel.
- Use Vercel Git integration for production and preview deployments.
- Treat the production branch as the authoritative production deployment;
  other branches and pull requests should use preview deployments.
- Store server credentials in Vercel encrypted environment variables. Never
  commit secrets or expose them with the `NEXT_PUBLIC_` prefix.
- Configure public `NEXT_PUBLIC_` values separately for development, preview,
  and production environments where their values differ.
- Use the Node.js runtime for server routes that require full Node.js APIs,
  billing provider SDK support, or external provider integrations.
- Keep the application full-stack. Do not configure `output: "export"` when
  authentication, webhooks, or background-removal routes are present.
- Vercel Functions have a limited request and response payload size. Before
  background removal is released, ensure the browser creates a bounded
  in-memory derivative that fits the current platform limit, validate that
  limit again on the server, and keep the original customer image local.
- Preview and production deployments must preserve the privacy rule that
  customer photos are never persisted by default.

## Testing

- Vitest
- Playwright
- WebMCP browser capability testing in Chromium when available

---

# 3. Repository Structure

Use one repository and one Next.js application.

```text
printchum/
├── app/
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── features/
│   │   ├── pricing/
│   │   ├── about/
│   │   ├── privacy/
│   │   └── terms/
│   │
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── callback/
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── editor/
│   │   ├── projects/
│   │   ├── service-sets/
│   │   ├── billing/
│   │   └── settings/
│   │
│   └── api/
│       ├── background-removal/
│       ├── checkout/
│       ├── billing-portal/
│       ├── credit-packs/
│       └── webhooks/
│
├── components/
│   ├── marketing/
│   ├── dashboard/
│   ├── editor/
│   └── ui/
│
├── features/
│   ├── auth/
│   ├── billing/
│   ├── editor/
│   ├── projects/
│   ├── service-sets/
│
├── lib/
│   ├── background-removal/
│   ├── billing/
│   ├── entitlements/
│   ├── layout-engine/
│   ├── webmcp/
│   ├── pdf/
│   ├── printing/
│   ├── supabase/
│   ├── validation/
│   └── permissions/
│
├── stores/
│   └── editor-store.ts
│
├── types/
├── tests/
│   ├── editor/webmcp-*.test.ts
│   └── e2e/webmcp-*.spec.ts
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── public/
├── AGENTS.md
└── SKILL.md
```

Do not place unrelated logic in generic folders such as `utils/` unless the code is genuinely cross-domain.

Prefer domain-specific modules.

---

# 4. Route Groups

Use Next.js route groups to separate application areas without changing public URLs.

## Marketing Routes

All marketing content must present the product as **PrintChum**.

```text
/
/features
/pricing
/about
/privacy
/terms
```

## Authentication Routes

```text
/login
/register
/forgot-password
/auth/callback
```

## Protected Application Routes

```text
/dashboard
/editor
/projects
/service-sets
/billing
/settings
```

Marketing and dashboard layouts must remain visually separate.

---

# 5. Product Scope

## 5.1 Core Editor

The editor must support:

- Upload one local photo
- Drag to reposition
- Scroll or slider to zoom
- Optional rotation
- One crop reused across multiple print sizes
- Standard and custom photo sizes
- Standard and custom paper sizes
- Portrait and landscape orientation
- Margins
- Horizontal and vertical spacing
- Mixed photo sizes
- Quantity per photo size
- Automatic page overflow
- Cutting guides
- Size labels
- Paper utilization
- Page navigation
- PDF download
- Direct print

## 5.2 Standard Photo Sizes

Support common presets such as:

- 1 × 1 in
- 1.5 × 1.5 in
- 2 × 2 in
- Passport
- Wallet
- 2R
- Half body
- Custom

Presets must not prevent users from entering arbitrary width and height values.

## 5.3 Paper Sizes

Support:

- Letter / Short bond
- Legal
- A4
- A3
- Photo paper presets where useful
- Fully custom width and height
- Inches
- Centimeters
- Millimeters

Do not assume that “long bond paper” always means the same dimensions in every country. Represent dimensions explicitly.

## 5.4 Service Sets

Users must be able to create, edit, duplicate, and delete service sets.

A service set may include:

- Name
- Description
- Price
- Photo sizes
- Quantities
- Paper preset
- Background color
- Nameplate settings
- Cutting-guide preference

Do not hard-code all service sets into a source file after the SaaS version is functional.

## 5.5 Nameplates

Support optional nameplates for:

- School photos
- Employee photos
- Resume photos
- Studio packages
- Application photos
- Organization IDs

Nameplate fields may include:

- Full name
- ID number
- Student number
- Employee number
- Department
- Section
- Position
- Date
- Custom text

Support:

- Inside-photo placement
- Outside-photo placement
- Top, bottom, or custom placement
- Font family
- Font size
- Font weight
- Alignment
- Background color
- Text color
- Border

---

# 6. Privacy and Data Handling Rules

## 6.1 Customer Images

Customer images must remain in memory by default.

Allowed temporary browser representations include:

- `File`
- `Blob`
- `ArrayBuffer`
- `ImageBitmap`
- `HTMLImageElement`
- Canvas bitmap
- Object URL

Clean up object URLs:

```ts
const url = URL.createObjectURL(file);

try {
  // Use the URL.
} finally {
  URL.revokeObjectURL(url);
}
```

Do not store customer images in:

- Supabase Storage
- PostgreSQL
- Local storage
- Analytics
- Error logs
- Server logs
- Build artifacts
- Test snapshots

## 6.2 Background Removal

Background removal is the only normal workflow that sends the image outside the browser.

Required flow:

1. Authenticate the user.
2. Verify plan access.
3. Verify AI-credit balance.
4. Validate MIME type.
5. Validate file size.
6. Send image to the server route.
7. Forward image to PhotoRoom.
8. Return the transparent result.
9. Deduct one credit only after successful processing.
10. Do not persist either image.

The server route must:

- Avoid writing the file to disk
- Avoid storage uploads
- Avoid request-body logging
- Avoid exposing provider error contents to users
- Return `Cache-Control: private, no-store`
- Enforce rate limits
- Enforce file size limits
- Validate allowed MIME types

## 6.3 Metadata Storage

The application may store:

- Account data
- Subscription data
- AI-credit usage
- Service-set presets
- Paper presets
- Layout templates
- Nameplate templates
- Billing records
- Non-image editor preferences

Do not store customer names unless a later approved feature explicitly requires it.

## 6.4 Analytics

Never send these to analytics:

- Customer photos
- Customer names
- File names
- Signed URLs
- Image hashes
- Nameplate text
- Full project data

Track only high-level product events.

## 6.5 WebMCP Data Boundary

WebMCP tools run in the user's browser and must preserve the same privacy
boundary as direct editor interactions. Tool arguments and results are not an
alternative storage channel. Do not place customer photos, image bytes,
object URLs, file names, crop bitmaps, nameplate text, or full project state in
analytics, server logs, persistent browser storage, or tool activity history.

The human-facing WebMCP activity list may contain only the tool name, outcome,
and timestamp. It must not retain arguments or results.

---

# 7. Layout Engine Rules

The layout engine is a framework-independent TypeScript module.

It must not import:

- React
- Next.js
- Zustand
- DOM APIs
- Supabase
- Polar
- PhotoRoom

Suggested files:

```text
lib/layout-engine/
├── types.ts
├── units.ts
├── paper-sizes.ts
├── placement.ts
├── packing.ts
├── pagination.ts
├── guides.ts
├── utilization.ts
└── calculate-layout.ts
```

## 7.1 Internal Unit

Use one canonical internal unit.

Recommended:

```ts
type InternalUnit = "inches";
```

Convert all input values to inches before calculation.

## 7.2 Layout Input

```ts
type LayoutInput = {
  paper: {
    widthInches: number;
    heightInches: number;
    orientation: "portrait" | "landscape";
  };
  marginInches: number;
  horizontalSpacingInches: number;
  verticalSpacingInches: number;
  items: Array<{
    id: string;
    widthInches: number;
    heightInches: number;
    quantity: number;
    allowRotation: boolean;
    nameplate?: NameplateLayoutConfig;
  }>;
};
```

## 7.3 Layout Output

```ts
type LayoutItem = {
  id: string;
  sourceItemId: string;
  pageIndex: number;
  xInches: number;
  yInches: number;
  widthInches: number;
  heightInches: number;
  rotation: 0 | 90;
};

type LayoutPage = {
  pageIndex: number;
  items: LayoutItem[];
};

type LayoutResult = {
  pages: LayoutPage[];
  // Total requested copies, including copies that could not be placed.
  totalItems: number;
  placedItems: number;
  unplacedItems: Array<{
    id: string;
    sourceItemId: string;
    widthInches: number;
    heightInches: number;
    allowRotation: boolean;
    reason: "ITEM_DOES_NOT_FIT";
    message: string;
  }>;
  utilizationPercent: number;
};
```

## 7.4 Determinism

Given identical input, the layout engine must return identical output.

Do not use unstable random ordering.

## 7.5 Auto Layout

The MVP may use deterministic shelf, row, or best-fit packing.

Do not prematurely implement complex optimization algorithms before correctness is proven.

Optimize for:

1. Correct physical dimensions
2. No overlap
3. Respect for margins
4. Respect for spacing
5. Correct pagination
6. Stable output
7. Reasonable paper utilization

## 7.6 Manual Layout

Manual layout may be added after the automatic layout is reliable.

Manual placement must still produce the same normalized `LayoutResult` format.

---

# 8. WebMCP Integration Rules

WebMCP is a progressive enhancement for the live PrintChum editor. It exposes
selected browser-side editor actions as structured tools for compatible,
browser-integrated AI agents. It is not a hosted MCP server, does not add a
JSON-RPC endpoint, and does not replace server-side APIs used for
authentication, billing, background removal, or future integrations.

The current WebMCP API is an emerging Draft Community Group Report, not a W3C
Standard. Treat the browser API as experimental and keep normal pointer,
keyboard, form, export, and print workflows fully functional when WebMCP is
missing, disabled, or rejected by browser policy.

Authoritative references:

- WebMCP specification: https://webmachinelearning.github.io/webmcp
- Chrome imperative API: https://developer.chrome.com/docs/ai/webmcp/imperative-api
- Chrome best practices: https://developer.chrome.com/docs/ai/webmcp/best-practices
- Chrome tool security: https://developer.chrome.com/docs/ai/webmcp/secure-tools
- WebMCP versus MCP: https://developer.chrome.com/docs/ai/webmcp/compare-mcp
- Browser implementation status: https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md

## 8.1 Platform Contract

- Use `document.modelContext`, not a server route or a standalone MCP
  transport, for the native WebMCP integration.
- Feature-detect `document.modelContext` and its methods before using it. Do
  not assume that a browser, a normal Chromium build, or a headless test
  runner supports WebMCP.
- WebMCP requires a secure context. Production and preview deployments must
  use HTTPS. Local development may use the browser's localhost secure-context
  exception, but API availability still depends on the browser build and
  feature configuration.
- WebMCP tools are ephemeral and tab-bound. They exist only while the editor
  document is open and the relevant component is mounted. Do not design a
  background job, persistent agent session, or server workflow around tool
  registration.
- The browser mediates discovery and execution. Same-origin tools are the
  default. Do not add `exposedTo`, `fromOrigins`, cross-origin iframes, or
  tool delegation unless a separately approved use case identifies the exact
  trusted origins and threat model.
- Do not use the deprecated `navigator.modelContext` alias in new code. If a
  compatibility fallback is ever required for a specific browser release, it
  must be isolated in `lib/webmcp/model-context-bridge.ts`, documented with a
  removal condition, and covered by tests.

## 8.2 Repository Architecture

Keep the WebMCP implementation in domain-specific modules:

```text
lib/webmcp/
└── model-context-bridge.ts

features/editor/webmcp/
├── tool-catalog.ts
├── input-schemas.ts
├── handlers.ts
├── tool-definitions.ts
└── register-editor-tools.ts

components/editor/
└── webmcp-registration.tsx

components/workspace/
├── webmcp-badge.tsx
├── webmcp-dialog.tsx
└── webmcp-status-dot.tsx

types/webmcp.d.ts
tests/editor/webmcp-*.test.ts
```

Responsibilities:

- `lib/webmcp/model-context-bridge.ts` owns feature detection, the deployment
  kill switch, registration, abort handling, and browser-specific error
  handling. It must remain free of editor business logic.
- `features/editor/webmcp/tool-catalog.ts` is the human-readable and
  agent-facing catalog. Keep tool names, titles, descriptions, summaries, and
  PrintChum permission categories together. This module must stay lightweight
  and import-free so workspace chrome does not pull PDF or image dependencies
  into its bundle.
- `features/editor/webmcp/input-schemas.ts` contains strict Zod schemas for
  every tool. Convert schemas to JSON Schema only at the WebMCP registration
  boundary. Runtime validation remains mandatory because agents can send
  malformed or adversarial input.
- `features/editor/webmcp/handlers.ts` adapts validated tool input to the
  existing Zustand editor store and domain services. Handlers must reuse the
  same layout, crop, PDF, and print logic as direct UI actions; never duplicate
  placement or output logic for agents.
- `features/editor/webmcp/tool-definitions.ts` joins each catalog entry to one
  schema and one handler. Keep the binding complete and fail loudly during
  development if the catalog and implementation drift apart.
- `features/editor/webmcp/register-editor-tools.ts` provides the editor-level
  registration entry point and must return explicit disabled, unsupported,
  blocked, and partially registered outcomes.
- `components/editor/webmcp-registration.tsx` is a client component mounted
  with the editor. It creates an `AbortController`, registers tools after mount,
  and aborts registration on unmount. React Strict Mode must not leave duplicate
  tools or warnings.
- Workspace WebMCP UI may show availability, the catalog, and minimal activity,
  but must never show or retain tool arguments or result payloads.
- `types/webmcp.d.ts` may augment `webmcp-types` only for verified API gaps.
  Keep version-specific notes and the corresponding official source next to
  the augmentation.

## 8.3 Tool Design Contract

Every tool must:

- Perform one clear function with a non-overlapping purpose.
- Use a stable name containing only ASCII letters, numbers, `_`, `-`, or `.`;
  keep the name at or below 30 characters where practical and never exceed the
  WebMCP limit of 128 characters.
- Have a concise, action-oriented description. Target no more than 500
  characters for the description and 150 characters for each parameter
  description.
- Declare specific primitive types and bounded enums in `inputSchema`.
- Accept user-level values where possible instead of requiring an agent to
  perform unit conversions or infer internal IDs. When IDs are necessary,
  provide a list/read tool that returns the valid IDs first.
- Validate all input in the handler using the matching strict Zod schema and
  return a safe, actionable error that does not expose stack traces or internal
  state.
- Update the visible editor state before resolving so the agent can rely on the
  page being ready for the next action.
- Return compact, JSON-serializable results. A single tool result should target
  no more than 1.5K characters and must not include binary data.

Use the WebMCP `readOnlyHint` annotation only for tools that do not change
editor state. PrintChum's internal permission categories are more detailed:

- `read`: inspect-only tools such as summaries and preset lists; annotate
  `readOnlyHint: true`.
- `write`: tools that change layout, paper, photo-size, nameplate, background,
  crop-mode, page, or service-set state; annotate `readOnlyHint: false`.
- `execute`: tools that initiate visible output actions such as PDF download or
  opening the print dialog; annotate `readOnlyHint: false` and keep explicit
  human confirmation where required.

If a tool returns user-generated or externally sourced text, evaluate whether
`untrustedContentHint: true` is appropriate. Do not add prompt-like
instructions to tool descriptions or results. Tool descriptions are part of
the model's input and must be treated as security-sensitive metadata.

## 8.4 Current Editor Tool Surface

The current implementation registers 17 editor tools. Keep the following
groups and behavior stable unless the tool catalog, tests, UI copy, and any
affected direct editor workflow are updated together:

- Inspect: `get-editor-summary`, `list-paper-presets`,
  `list-photo-size-presets`, `list-service-sets`, `list-nameplate-presets`.
- Configure: `configure-paper`, `add-photo-size`, `update-photo-size`,
  `remove-photo-size`, `apply-service-set`, `configure-nameplate`,
  `set-preview-page`, `set-background`, `set-crop-mode`.
- Save and print: `save-service-set`, `export-pdf`, `open-print-dialog`.

The tool contract must preserve these invariants:

- `get-editor-summary` returns layout metadata, paper settings, photo-size
  metadata, and placement counts, never photo pixels.
- Preset-list tools return IDs and dimensions, not customer images or
  nameplate contents.
- Layout mutations use the existing Zustand actions and authoritative
  `calculateLayout()` result. They must respect unit normalization, margins,
  spacing, rotation, pagination, overflow, and utilization rules.
- `export-pdf` uses the same `createPdfExportInputFromEditorState` and PDF
  service used by the direct export dialog. It may initiate a browser download
  but returns only safe file metadata.
- `open-print-dialog` may open the visible PrintChum print dialog but may not
  silently print or bypass the user's confirmation.
- WebMCP must not provide a tool that uploads a photo, reads a local file,
  returns an object URL, exposes crop bitmaps, invokes background removal, or
  sends image bytes to an agent. Background removal remains an explicit direct
  user action through the existing server route and its entitlement/credit
  checks.

## 8.5 Registration Lifecycle

Register only after the editor client component mounts and only when all of the
following are true:

1. The deployment kill switch is enabled.
2. `document.modelContext` exists in the current secure browser context.
3. The editor is mounted and its handlers can access the current Zustand state.

Registration rules:

- Register each tool with `document.modelContext.registerTool(tool, { signal })`.
- Pass one `AbortSignal` for the editor registration scope. Aborting must
  unregister the tools and stop any in-progress registration without treating
  expected cleanup as an error.
- Register tools deterministically in catalog order. Do not register duplicate
  names, and do not silently replace a tool with a different schema.
- Handle `NotAllowedError` as a permissions-policy block and degrade to the
  normal editor. Handle unsupported APIs, duplicate registration, invalid
  schemas, and other failures without breaking the editor.
- If registration is partial, expose the actual registered count in the UI and
  never claim that the full catalog is available.
- If tools become state-dependent in a future route or editor mode, register
  them only while usable and unregister them when that state ends. Avoid ghost
  tools that describe controls the user cannot currently use.
- If a tool receives an execution signal in a browser implementation that
  supports it, forward the signal to cancellable async work such as `fetch()`
  and PDF generation. Never continue a costly or side-effecting operation after
  the agent or browser cancels it.

## 8.6 Privacy and Security Boundary

WebMCP does not weaken any PrintChum privacy rule:

- Customer photos stay in browser memory by default. Tool registration and
  execution must not persist `File`, `Blob`, `ArrayBuffer`, `ImageBitmap`,
  canvas data, object URLs, or source file names.
- Tool arguments and results must not be sent to analytics, Sentry, server
  logs, activity-history APIs, local storage, session storage, IndexedDB,
  cookies, URL parameters, or database tables.
- The activity list may store only the tool name, `ok` or `failed` outcome, and
  timestamp, with a small in-memory limit. It must not store arguments or
  result objects.
- Never include nameplate text, customer names, image hashes, signed URLs,
  crop coordinates tied to an image, or full editor state in telemetry or
  human-facing activity history.
- Treat tool inputs, tool descriptions, preset metadata, and handler outputs as
  untrusted content. Use strict validation, bounded strings and quantities,
  allowlisted enums, and safe user-readable errors.
- Read tools can still disclose private account or layout metadata. Do not
  expose organization data, saved service sets, billing data, or future project
  data beyond what the active user is authorized to see.
- Write and execute tools are user-authorized capabilities, not authorization
  substitutes. Server-side routes remain authoritative for authentication,
  organization ownership, entitlements, billing, credits, rate limits, and
  external provider calls.
- Do not expose tools to another origin. If a future integration needs
  cross-origin exposure, use only explicit HTTPS origins, configure both sides'
  permission/origin policy, obtain approval, and add a threat-model review.
- PDF export and printing are visible user actions. Never add silent printing,
  hidden downloads, automatic checkout, destructive deletion, or other
  consequential side effects behind a WebMCP call without explicit approval.

## 8.7 Configuration and Deployment

WebMCP uses no provider secret, API key, database table, server endpoint, or
additional Vercel runtime. Required configuration is browser and deployment
policy configuration only:

```env
# Optional public build-time kill switch. Unset or any non-off value enables
# registration; false, 0, or off disables it.
NEXT_PUBLIC_WEBMCP_ENABLED=true
```

Configuration rules:

- `NEXT_PUBLIC_WEBMCP_ENABLED` is intentionally public because it controls
  client behavior, not authorization. It must never be used as a server-side
  security check.
- Unset means enabled in the current implementation. Set it to `false`, `0`,
  or `off` to disable registration without a code rollback. Keep the value
  consistent across local, preview, and production environments and document
  changes in the deployment record.
- Keep the `Permissions-Policy` response header's `tools=(self)` directive in
  `next.config.ts` for top-level same-origin registration. Do not broaden it to
  `*` or delegate it to arbitrary iframe origins.
- Keep existing CSP and security headers intact. WebMCP does not justify
  `unsafe-eval`, wildcard `connect-src`, wildcard `script-src`, or weakened
  frame protections in production.
- Deploy through the native Next.js Vercel integration. Do not add an MCP
  server, proxy, edge adapter, custom transport, or platform-specific runtime
  solely for WebMCP.
- Preview and production must remain HTTPS and must preserve the no-photo
  persistence rule. A preview build must be treated as an agent-callable
  surface when the browser supports WebMCP.
- If the browser lacks WebMCP, do not ship a polyfill by default. A polyfill or
  MCP bridge would create a separate security and support model and requires
  explicit approval.

## 8.8 Testing and Verification

WebMCP tests must prove both capability behavior and graceful degradation:

- Unit-test the kill switch for unset, truthy, and explicit off values.
- Unit-test feature detection without `window`, without `document`, and
  without `document.modelContext`.
- Unit-test registration abort on unmount, mid-registration cancellation,
  duplicate registration, `NotAllowedError`, invalid schemas, and unrelated
  registration failures.
- Unit-test catalog/handler/schema completeness, tool-name constraints,
  annotations, compact result shapes, and the absence of image data from all
  result builders.
- Unit-test each handler's schema validation and safe error behavior. Include
  oversized quantities, invalid units, unsupported preset IDs, invalid colors,
  malformed names, unknown item IDs, oversized dimensions, and page overflow.
- Verify that WebMCP handlers and direct UI actions produce the same layout,
  PDF, and print behavior. Do not create WebMCP-only placement or export
  implementations.
- Run `npm run test` for unit coverage and `npm run typecheck` for the ambient
  WebMCP typings.
- Run `npm run test:e2e` for normal browser regression coverage. The tests must
  pass or skip cleanly in browsers without WebMCP.
- Set `WEBMCP_E2E=1` to opt into the WebMCP Playwright suite. This suite
  requires a WebMCP-enabled Chromium build or origin-trial configuration and
  uses the `--enable-features=WebMCPTesting` launch flag in the current setup.
- The WebMCP E2E suite must verify discovery of all 17 tools, the five read-only
  and twelve non-read-only annotations, representative read/write/output
  executions, visible editor updates, PDF download behavior, human-gated
  printing, and privacy-safe activity history.
- Run the browser suite against the exact browser build used for release when
  the API changes. WebMCP is experimental and may change independently of the
  application dependencies.
- Do not put customer photos, personal nameplate data, generated private PDFs,
  or tool argument/result dumps in test fixtures, traces, snapshots, or CI
  artifacts.

## 8.9 Change Checklist

Before adding or changing a WebMCP tool:

1. Confirm that the capability belongs in the live browser editor and not in a
   server API or future MCP server.
2. Add one catalog entry with a clear name, title, description, summary, and
   permission category.
3. Add a strict Zod input schema with bounded values and useful descriptions.
4. Implement a handler that calls existing domain/store logic and returns a
   compact, JSON-safe result.
5. Add the schema/handler binding and verify catalog completeness.
6. Decide whether `readOnlyHint` or `untrustedContentHint` applies.
7. Confirm that no photo bytes, object URLs, file names, crop bitmaps,
   nameplate text, or full project state can enter arguments, results, logs, or
   activity history.
8. Add unit tests for valid input, invalid input, state changes, errors, and
   privacy boundaries.
9. Update the WebMCP UI grouping, count, and user-facing copy when the catalog
   changes.
10. Update the WebMCP E2E expected tool list and representative workflow.
11. Verify unsupported-browser behavior, abort cleanup, permissions-policy
   behavior, and the production kill switch.
12. Re-check the official specification and Chrome documentation before relying
   on a changed or newly introduced API member.

---

# 9. Canvas Rendering Rules

Canvas is the live preview renderer.

It must not calculate layout placement independently.

Use:

```text
LayoutInput
→ calculateLayout()
→ LayoutResult
→ Canvas renderer
```

Canvas responsibilities:

- Draw paper
- Draw photos
- Apply crop
- Apply background color
- Draw nameplates
- Draw cutting guides
- Draw labels
- Render page navigation preview

Canvas must support high-DPI displays using `devicePixelRatio`.

Do not use the preview canvas as the only source for high-quality PDF output.

---

# 10. Crop Rules

Use `react-easy-crop` for interactive cropping.

Store crop state in a format that can be reused across output sizes.

Recommended:

```ts
type CropState = {
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  zoom: number;
  rotation: number;
};
```

Avoid storing only screen-pixel coordinates.

When applying the same source crop to different aspect ratios, support explicit behavior:

- `keep-head-size`
- `fill-frame`
- `fit-with-padding`

Do not silently distort the image.

---

# 11. PDF Generation Rules

Use `pdf-lib`.

The PDF generator must consume the same `LayoutResult` used by Canvas.

Required output features:

- Exact physical page size
- Multiple pages
- Embedded raster images
- Background colors
- Nameplates
- Cutting guides
- Size labels
- Custom paper sizes

Use:

```ts
const points = inches * 72;
const rasterPixels = inches * 300;
```

Do not:

- Stretch images without preserving intended crop behavior
- Use screenshot-based PDF generation as the primary path
- Depend on browser zoom level
- Depend on display DPI
- Assume one PDF DPI value applies to the page itself

---

# 12. Direct Printing Rules

Provide two actions:

- Print
- Download PDF

The recommended print flow is:

1. Generate the authoritative PDF in memory.
2. Create a temporary object URL.
3. Open the PDF or print view.
4. Allow the user to confirm through the system print dialog.
5. Revoke the temporary object URL.

Do not attempt silent printing in the public web MVP.

Show print instructions:

- Paper size must match the selected layout
- Scale must be 100% or Actual Size
- Margins must be None
- Browser headers and footers must be Off

Silent or one-click printer-agent support is a later feature.

---

# 13. Subscription and Pricing Rules

Initial plans:

## Free

- Limited exports
- Watermark
- One trial background removal
- Basic presets
- No business workflows

## Pro

- Monthly: $9
- Yearly: $90
- Unlimited normal exports
- No watermark
- 50 background removals per month
- One user
- Custom sizes and paper
- Saved non-photo templates

## Studio

- Monthly: $19
- Yearly: $190
- Unlimited normal exports
- 250 background removals per month
- Business service sets
- Up to three staff accounts
- Studio settings
- Future order-management capability

Business plan is deferred until multi-branch and bulk-processing features exist.

## 13.1 Unlimited Exports

Unlimited exports means:

- No monthly export quota
- No per-export charge
- Subject to technical abuse prevention
- Subject to active subscription
- Subject to reasonable-use controls

Do not deduct AI credits for:

- PDF export
- PNG export
- JPG export
- Re-export
- Background color changes
- Layout regeneration

## 13.2 AI Credits

One AI credit equals one successful PhotoRoom background-removal operation.

Credits must not be deducted for failed requests.

Monthly included credits:

- Reset every billing month
- Do not roll over
- Are consumed before purchased credits

Purchased credits:

- May remain valid for a defined period
- Must be tracked separately
- Must not be silently removed on subscription downgrade

## 13.3 Yearly Plans

Yearly subscriptions are billed once per year.

AI credits are still released monthly.

Do not release the full annual AI-credit allowance immediately.

---

# 14. Billing Rules

Use Polar (polar.sh) as the billing provider.

Polar is the Merchant of Record: it is the legal seller for each transaction,
handles global VAT and sales tax, and issues payouts through Stripe Connect
Express. Do not build custom tax calculation, tax remittance, or invoicing
flows on top of it.

Products and prices are configured in the Polar dashboard. Server routes
create checkouts from Polar product price IDs and never accept plan or price
identifiers from the browser.

Required capabilities:

- Monthly plans
- Yearly plans
- Checkout
- Customer portal
- Upgrade
- Downgrade
- Cancel at period end
- Payment failure handling
- AI-credit packs
- Webhook-driven subscription state

Subscription state must be updated from verified Polar webhooks. Verify
webhook signatures with the Polar webhook secret and process events
idempotently; duplicate deliveries are expected.

Do not trust:

- Client-submitted plan prices
- Client-submitted credit quantities
- Success-page redirects
- Hidden UI state
- Query-string plan identifiers without server validation

Required subscription states:

```ts
type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired"
  | "paused";
```

Map Polar subscription statuses (`trialing`, `active`, `past_due`,
`canceled`, `unpaid`, `incomplete_expired`) onto these application states in
the webhook handlers. The application state, not the Polar payload, remains
the source of truth for entitlements.

---

# 15. Entitlement Rules

Create a centralized entitlement layer.

Do not scatter plan checks throughout components.

Suggested API:

```ts
type Entitlements = {
  unlimitedExports: boolean;
  watermarkRequired: boolean;
  backgroundRemovalCredits: number;
  canUseCustomSizes: boolean;
  canUseCustomPaper: boolean;
  canUseServiceSets: boolean;
  maxTeamMembers: number;
};

async function getEntitlements(
  organizationId: string
): Promise<Entitlements>;
```

Both UI and server routes may consume entitlement data, but the server remains authoritative.

---

# 16. Database Rules

Use organization-based ownership from the start.

```text
User
└── Organization
    ├── Members
    ├── Subscription
    ├── Service Sets
    ├── Presets
    └── Usage
```

Recommended tables:

```text
profiles
organizations
organization_members

plans
subscriptions
usage_balances
usage_transactions
credit_purchases

service_sets
service_set_items
paper_presets
nameplate_templates

projects
project_settings

activity_logs
```

Projects must not include customer images.

All organization-owned tables must include:

```text
organization_id
```

Enable Row Level Security before exposing tables to the browser.

---

# 17. Authentication and Authorization

Use Supabase Auth.

Initial methods:

- Email and password
- Password reset
- Email verification

Google sign-in may be added later.

Protected routes must verify authentication on the server.

Authorization rules must distinguish:

- Account owner
- Admin
- Member

Do not rely only on frontend route hiding.

---

# 18. Validation Rules

Use Zod for all external input.

Validate:

- File type
- File size
- Width and height
- Units
- Quantity
- Margins
- Spacing
- Paper dimensions
- Nameplate text lengths
- Plan IDs
- Price IDs
- Credit quantities
- Organization ownership

Example:

```ts
const dimensionSchema = z.object({
  width: z.number().positive().max(100),
  height: z.number().positive().max(100),
  unit: z.enum(["in", "cm", "mm"]),
});
```

Never trust browser-submitted values.

---

# 19. Error Handling

Use user-readable errors.

Avoid exposing:

- Stack traces
- Provider response bodies
- Database internals
- Secret identifiers
- Polar payload details
- PhotoRoom API details
- Environment-variable names

Example user-facing messages:

- “The image could not be processed. Try another photo.”
- “Your AI credits have been used for this billing period.”
- “The selected dimensions do not fit on the chosen paper.”
- “Printing requires the paper scale to be set to Actual Size.”
- “Your session photo will be lost if you leave this page.”

Log technical details only on the server, and never log image contents.

---

# 20. Security Rules

## Secrets

Keep secrets server-side.

Never expose these using `NEXT_PUBLIC_`:

- Supabase service-role key
- PhotoRoom API key
- Polar access token
- Polar webhook secret
- Sentry server token

## Upload Validation

Allow only approved formats:

- JPEG
- PNG
- WebP
- HEIC only if the selected processing path supports it

Set explicit file-size limits.

Reject malformed files.

## Rate Limiting

Rate-limit:

- Background removal
- Checkout creation
- Credit-pack purchase
- Authentication abuse
- Webhooks where appropriate
- Repeated export automation if server-side work is introduced

## Logging

Do not log:

- Image data
- Base64 image strings
- Uploaded file names unless sanitized
- Customer nameplate contents
- Signed URLs
- Secret headers

---

# 21. UI and UX Rules

Use a professional SaaS design.

## Visual Direction

- Follow the `bryl-minimal` design language defined in `SKILL.md`
- Strictly monochrome palette with no accent color
- Support light, dark, and system themes using semantic color tokens
- Default to the operating-system theme and persist explicit theme choices
- Use Geist for UI, Geist Mono for technical labels, and Geist Pixel Square for display text
- Use true black on white in light mode and off-white on near-black in dark mode
- Use hairline neutral borders, rare filled surfaces, and soft low-alpha shadows
- Use the 16px / 12px / 8px / 6px radius ladder
- Use tiny uppercase monospace labels for metadata, status, tags, and navigation
- Use a restrained halftone-dot motif in no more than one or two places per page
- Use brief, ease-out motion and honor `prefers-reduced-motion`
- Preserve strong spacing hierarchy and generous whitespace
- Desktop-first editor
- Responsive marketing pages
- No colorful or decorative gradients; subtle neutral surface fades are allowed
- No glassmorphism
- No neumorphism
- No decorative clutter

## Editor Layout

Recommended desktop layout:

```text
Left panel:
- Upload
- Crop controls
- Service sets
- Photo sizes
- Paper settings
- Nameplate
- Background tools

Main area:
- Page preview
- Page navigation
- Zoom controls
- Paper usage

Top actions:
- Reset
- Print
- Download PDF
```

## Accessibility

All controls must include:

- Accessible labels
- Keyboard focus
- Visible focus state
- Sufficient contrast
- Button text or tooltips
- Error association
- Proper form semantics

Do not make critical functionality icon-only.

---

# 22. Performance Rules

Avoid unnecessary re-rendering during:

- Crop dragging
- Zooming
- Slider changes
- Canvas redraw
- Page navigation

Use:

- Memoized layout calculations
- Debounced persistence
- `requestAnimationFrame` for canvas redraw where useful
- Web Workers later only if layout or PDF generation becomes blocking

Do not save every editor change to the database.

Use browser memory for active editor state.

---

# 23. Testing Requirements

## Unit Tests

Use Vitest for:

- Unit conversion
- Paper orientation
- Margin calculation
- Spacing calculation
- Pagination
- Overflow
- Mixed-size placement
- Rotation
- Utilization percentage
- Nameplate dimensions
- Subscription entitlements
- Credit deduction
- Credit reset logic

## End-to-End Tests

Use Playwright for:

```text
Register
→ Login
→ Upload photo
→ Crop
→ Add sizes
→ Configure paper
→ Generate layout
→ Download PDF
```

Also test:

```text
Subscribe
→ Polar webhook received
→ Paid entitlement activated
→ Background removal succeeds
→ Credit deducted
```

## Required Edge Cases

Test:

- Very small image
- Very large image
- Portrait source
- Landscape source
- Transparent PNG source
- Mixed units
- Oversized photo item
- Zero available placements
- Multiple overflow pages
- Nameplate larger than photo
- Unsupported paper dimensions
- Background-removal timeout
- Duplicate webhook
- Payment failure
- Expired subscription

---

# 24. Development Order

Follow this order unless the user explicitly changes priorities.

## Phase 1: Foundation

- Next.js setup
- TypeScript
- Tailwind
- shadcn/ui
- Supabase configuration
- Basic route groups
- Environment validation

## Phase 2: Core Layout Engine

- Units
- Paper dimensions
- Photo-size definitions
- Packing
- Pagination
- Utilization
- Unit tests

## Phase 3: Editor

- Upload
- Crop
- Zoom
- Size selection
- Custom dimensions
- Paper settings
- Canvas preview
- Cutting guides
- Labels

## Phase 4: Output

- PDF generation
- Multi-page PDF
- Direct print
- Print instructions
- Nameplates

## Phase 5: Presets

- Service sets
- Custom paper presets
- Preset metadata and verification dates

## Phase 6: Authentication and SaaS

- Supabase Auth
- Organizations
- Protected routes
- Subscription records
- Entitlements

## Phase 7: Background Removal

- PhotoRoom provider abstraction
- Server route
- AI-credit checks
- Transparent PNG result
- Canvas background colors

## Phase 8: Billing

- Polar products and prices
- Monthly and yearly checkout
- Webhooks
- Billing portal
- Credit packs

## Phase 9: Marketing

- Complete landing page
- Features
- Pricing
- FAQ
- Privacy
- Terms
- Product screenshots

## Phase 10: Later Features

- Offline PWA
- Customer and order management
- Batch processing
- Multi-branch support
- Silent print agent
- Advanced compliance checking

---

# 25. Code Quality Rules

## TypeScript

- Avoid `any`
- Prefer explicit domain types
- Use discriminated unions for state
- Validate unknown input
- Do not suppress compiler errors without explanation

## Components

- Keep components focused
- Extract domain logic from JSX
- Avoid files with excessive responsibilities
- Do not perform layout calculations directly in visual components

## Naming

Use clear domain names:

```text
calculateLayout
generatePdf
removeBackground
getEntitlements
normalizeDimensions
createPaperPreset
```

Avoid vague names:

```text
handleData
processThing
helper
misc
doStuff
```

## Comments

Comments should explain:

- Why a decision exists
- Why a workaround is necessary
- Important measurement rules
- Security or privacy constraints
- Non-obvious billing behavior

Do not comment obvious syntax.

Avoid AI-style comments that restate every line.

---

# 26. Git Rules

Use clear commit messages:

```text
feat(editor): add custom paper dimensions
fix(layout): prevent overlap after rotation
feat(billing): add yearly Polar checkout
test(pdf): cover multi-page legal paper export
refactor(layout): isolate unit conversion
```

Do not commit:

- `.env`
- API keys
- Service-role keys
- Customer photos
- Generated private PDFs
- Local database dumps
- Test artifacts containing personal data

---

# 27. Environment Variables

Recommended variables:

```env
NEXT_PUBLIC_APP_NAME=PrintChum
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# WebMCP is enabled when unset; set to false, 0, or off to disable.
NEXT_PUBLIC_WEBMCP_ENABLED=true

SUPABASE_SERVICE_ROLE_KEY=

PHOTOROOM_API_KEY=

POLAR_ACCESS_TOKEN=
POLAR_ORGANIZATION_ID=
POLAR_WEBHOOK_SECRET=

POLAR_PRO_MONTHLY_PRICE_ID=
POLAR_PRO_YEARLY_PRICE_ID=
POLAR_STUDIO_MONTHLY_PRICE_ID=
POLAR_STUDIO_YEARLY_PRICE_ID=

SENTRY_DSN=
```

Validate environment variables at startup.

Do not access missing secrets silently.

---

# 28. Decisions That Require Approval

Do not implement these without explicit approval:

- Permanent customer-photo storage
- Facial recognition
- Identity matching
- Biometric templates
- Government database integrations
- AI training using customer uploads
- Public image galleries
- Child-operated accounts
- Silent printing
- Desktop companion app
- Multi-region data storage
- Background-removal provider replacement
- Billing provider replacement (currently Polar)
- Unlimited AI processing
- Lifetime subscriptions

---

# 29. Definition of Done

A feature is done only when:

- It satisfies the product requirement
- It has validation
- It has user-readable errors
- It respects privacy rules
- It respects subscription entitlements
- It works with custom dimensions where applicable
- It is tested at the appropriate level
- It does not duplicate domain logic
- It does not expose secrets
- It does not store customer photos
- It is usable on the target desktop layout
- It does not break print or PDF accuracy

---

# 30. First Production Release Scope

The first paid release of **PrintChum** should include:

- Marketing homepage
- Features page
- Pricing page
- Privacy Policy
- Terms of Service
- Authentication
- Pro and Studio subscriptions
- Monthly and yearly billing
- AI-credit tracking
- Background removal
- Background color replacement
- Standard and custom photo sizes
- Standard and custom paper sizes
- Optional nameplates
- Service sets
- Accurate Canvas preview
- Multi-page PDF export
- Direct print
- No permanent customer-photo storage

Do not delay the release for:

- Offline mode
- Multi-branch support
- Bulk school processing
- Customer CRM
- Complex analytics
- Silent printing
- Mobile application
- Desktop application

---

# 31. Working Agreement

Before implementing any feature:

1. Identify the domain module.
2. Confirm whether it belongs in the browser or server.
3. Confirm whether it processes customer photos.
4. Confirm whether it creates a provider cost.
5. Confirm whether it requires entitlement checks.
6. Confirm the physical measurement rules.
7. Add or update tests.
8. Keep the implementation consistent with `SKILL.md`.

When `AGENTS.md` and `SKILL.md` overlap:

- `AGENTS.md` defines project architecture, product scope, privacy rules, and engineering constraints.
- `SKILL.md` defines reusable implementation practices and specialized workflows.
- A direct user instruction overrides both.
- Security, privacy, billing, and data-integrity rules must not be weakened without explicit approval.
