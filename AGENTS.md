# AGENTS.md

## Project Identity

- **Product name:** PrintChum
- **Brand capitalization:** `PrintChum`
- **Primary domain:** `printchum.com` when available and registered
- **Product category:** Privacy-first photo layout and printing SaaS
- **Primary tagline:** Upload once. Print every size.

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
- Stripe Billing
- Vercel
- Sentry when production monitoring is added

## Testing

- Vitest
- Playwright

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

---

# 7. Layout Engine Rules

The layout engine is a framework-independent TypeScript module.

It must not import:

- React
- Next.js
- Zustand
- DOM APIs
- Supabase
- Stripe
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

# 8. Canvas Rendering Rules

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

# 9. Crop Rules

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

# 10. PDF Generation Rules

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

# 11. Direct Printing Rules

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

# 12. Subscription and Pricing Rules

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

## 12.1 Unlimited Exports

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

## 12.2 AI Credits

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

## 12.3 Yearly Plans

Yearly subscriptions are billed once per year.

AI credits are still released monthly.

Do not release the full annual AI-credit allowance immediately.

---

# 13. Billing Rules

Use Stripe Billing.

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

Subscription state must be updated from verified Stripe webhooks.

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

---

# 14. Entitlement Rules

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

# 15. Database Rules

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

# 16. Authentication and Authorization

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

# 17. Validation Rules

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

# 18. Error Handling

Use user-readable errors.

Avoid exposing:

- Stack traces
- Provider response bodies
- Database internals
- Secret identifiers
- Stripe payload details
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

# 19. Security Rules

## Secrets

Keep secrets server-side.

Never expose these using `NEXT_PUBLIC_`:

- Supabase service-role key
- PhotoRoom API key
- Stripe secret key
- Stripe webhook secret
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

# 20. UI and UX Rules

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

# 21. Performance Rules

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

# 22. Testing Requirements

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
→ Stripe webhook received
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

# 23. Development Order

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

- Stripe products and prices
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

# 24. Code Quality Rules

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

# 25. Git Rules

Use clear commit messages:

```text
feat(editor): add custom paper dimensions
fix(layout): prevent overlap after rotation
feat(billing): add yearly Stripe checkout
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

# 26. Environment Variables

Recommended variables:

```env
NEXT_PUBLIC_APP_NAME=PrintChum
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

PHOTOROOM_API_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

STRIPE_PRO_MONTHLY_PRICE_ID=
STRIPE_PRO_YEARLY_PRICE_ID=
STRIPE_STUDIO_MONTHLY_PRICE_ID=
STRIPE_STUDIO_YEARLY_PRICE_ID=

SENTRY_DSN=
```

Validate environment variables at startup.

Do not access missing secrets silently.

---

# 27. Decisions That Require Approval

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
- Unlimited AI processing
- Lifetime subscriptions

---

# 28. Definition of Done

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

# 29. First Production Release Scope

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

# 30. Working Agreement

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
