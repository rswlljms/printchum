export type EditorToolPermission = "read" | "write" | "execute";

export type EditorToolCatalogEntry = {
  name: string;
  title: string;
  description: string;
  summary: string;
  permission: EditorToolPermission;
  untrustedContentHint?: boolean;
};

// Single source of truth for the agent-facing tool surface and the in-app
// discovery UI. This module must stay import-free: the workspace header
// renders the catalog, and handler modules pull heavy dependencies (pdf-lib)
// that must never reach the header bundle.
// `description` is the agent-facing contract sent to document.modelContext;
// `summary` is the short human-facing line shown in the discovery dialog.
export const editorToolCatalog: readonly EditorToolCatalogEntry[] = [
  {
    name: "get-editor-summary",
    title: "Get editor summary",
    summary: "Read the current paper, sizes, quantities, pages, and utilization.",
    description:
      "Returns the current print layout state: paper settings, photo size items with quantities, selected service set, page count, active page, placed item count, paper utilization, unplaced items, and any layout error. Photo pixel data is never included.",
    permission: "read",
    untrustedContentHint: true,
  },
  {
    name: "list-paper-presets",
    title: "List paper presets",
    summary: "List standard and saved paper presets.",
    description:
      "Returns available standard paper presets (id, name, dimensions, unit) plus the user's saved custom paper presets. Use an id from this list as presetId in configure-paper.",
    permission: "read",
    untrustedContentHint: true,
  },
  {
    name: "list-photo-size-presets",
    title: "List photo size presets",
    summary: "List photo size presets like passport and wallet.",
    description:
      "Returns available photo size presets such as ID photos, passport, wallet, and portrait prints (id, name, dimensions, unit, default quantity). Use an id from this list as presetId in add-photo-size.",
    permission: "read",
    untrustedContentHint: true,
  },
  {
    name: "list-service-sets",
    title: "List service sets",
    summary: "List the user's saved photo packages.",
    description:
      "Returns the user's saved service sets (packages of photo sizes, paper, and pricing) that can be applied to the editor in one step.",
    permission: "read",
    untrustedContentHint: true,
  },
  {
    name: "list-nameplate-presets",
    title: "List nameplate presets",
    summary: "List nameplate starting points and styles.",
    description:
      "Returns the available nameplate starting points (id, name, description) such as full name, name and ID, and name with department. Use an id from this list as presetId in configure-nameplate.",
    permission: "read",
  },
  {
    name: "configure-paper",
    title: "Configure paper",
    summary: "Set paper preset or custom size, orientation, margin, and spacing.",
    description:
      "Changes the print sheet configuration. Provide presetId to switch to a standard paper, or width/height/unit for custom dimensions. Optionally also set orientation, margin, spacing, and cutting guides. Margin and spacing values are interpreted in the resulting paper display unit. The preview updates immediately.",
    permission: "write",
    untrustedContentHint: true,
  },
  {
    name: "add-photo-size",
    title: "Add photo size",
    summary: "Add a preset or custom photo size with a copy quantity.",
    description:
      "Adds a photo size to the layout by presetId or custom width/height/unit, optionally with a copy quantity, and the preview updates immediately with the new placement. Returns the created item id needed by update-photo-size, remove-photo-size, and configure-nameplate.",
    permission: "write",
    untrustedContentHint: true,
  },
  {
    name: "update-photo-size",
    title: "Update photo size",
    summary: "Change a size's quantity, rotation, or nameplate toggle.",
    description:
      "Updates an existing photo size item: change quantity, allowRotation, or enable or disable its nameplate. The preview updates immediately. Identify the item with the itemId returned when it was added or listed in get-editor-summary.",
    permission: "write",
    untrustedContentHint: true,
  },
  {
    name: "remove-photo-size",
    title: "Remove photo size",
    summary: "Remove a photo size from the layout.",
    description:
      "Removes a photo size item from the layout and recalculates placement; the preview updates immediately.",
    permission: "write",
    untrustedContentHint: true,
  },
  {
    name: "apply-service-set",
    title: "Apply service set",
    summary: "Apply a saved photo package in one step.",
    description:
      "Applies one of the user's service sets, replacing the current photo sizes and paper configuration with the package definition. The preview updates immediately. Disabled service sets are reported instead of applied.",
    permission: "write",
    untrustedContentHint: true,
  },
  {
    name: "configure-nameplate",
    title: "Configure nameplate",
    summary: "Set nameplate text, style, and position on a photo size.",
    description:
      "Creates or updates the nameplate attached to a photo size item, and the nameplate renders on the preview immediately. Optionally start from presetId (full-name, name-and-id, name-id-department, custom), then override text lines (name, ID number, department), position relative to the photo, font size and weight, alignment, and colors.",
    permission: "write",
    untrustedContentHint: true,
  },
  {
    name: "set-preview-page",
    title: "Set preview page",
    summary: "Show a specific layout page in the preview.",
    description:
      "Shows the layout page the user should look at next in the canvas preview. Page numbers start at 1; get-editor-summary reports pageCount and the current activePageNumber.",
    permission: "write",
    untrustedContentHint: true,
  },
  {
    name: "set-background",
    title: "Set background",
    summary: "Set the background mode and solid color.",
    description:
      "Sets the photo background treatment: original keeps the photo as uploaded, solid composites the photo over the given hex color (defaults to white), and transparent is reserved for photos whose background has been removed. The preview updates immediately.",
    permission: "write",
    untrustedContentHint: true,
  },
  {
    name: "set-crop-mode",
    title: "Set crop mode",
    summary: "Choose how the crop fills each photo size.",
    description:
      "Chooses how the user's crop fills each photo size: keep-head-size preserves the subject's apparent size across sizes, fill-frame fills each frame and may crop edges, and fit-with-padding fits the whole crop inside the frame with padding. The preview updates immediately.",
    permission: "write",
    untrustedContentHint: true,
  },
  {
    name: "save-service-set",
    title: "Save service set",
    summary: "Save the current layout as a reusable package.",
    description:
      "Saves the current photo sizes and paper configuration as a reusable service set with the given name and optional price, and the new service set appears in the user's list immediately for later use with apply-service-set.",
    permission: "write",
    untrustedContentHint: true,
  },
  {
    name: "export-pdf",
    title: "Export PDF",
    summary: "Generate the print-ready PDF and start the download.",
    description:
      "Generates a print-ready PDF of all pages at exact physical dimensions and starts the browser download immediately. Requires a loaded photo and at least one placed photo size. Returns only file metadata; image data stays in the browser. A user-visible download appears in the browser.",
    permission: "execute",
    untrustedContentHint: true,
  },
  {
    name: "open-print-dialog",
    title: "Open print dialog",
    summary: "Open the print dialog for the user to confirm.",
    description:
      "Opens the print options dialog on screen immediately so the user can review printer settings (paper size match, Actual Size scaling, no margins) and confirm printing. Printing always requires explicit human confirmation.",
    permission: "execute",
    untrustedContentHint: true,
  },
];
