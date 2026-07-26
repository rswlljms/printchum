export const dashboardMetrics = [
  { label: "Layouts created", value: "38", detail: "This month" },
  { label: "AI credits remaining", value: "184", detail: "of 250 monthly" },
  { label: "Saved templates", value: "12", detail: "Layout settings only" },
  { label: "Most-used photo size", value: "2 × 2", detail: "18 layouts" },
] as const;

export const recentTemplates = [
  { id: "template-1", name: "Passport 2 × 2 on Letter", detail: "Letter · 12 photos" },
  { id: "template-2", name: "School ID with nameplate", detail: "A4 · 8 photos" },
  { id: "template-3", name: "Mixed ID photo package", detail: "Letter · 10 photos" },
] as const;

export const recentPassportPresets = [
  { country: "Philippines", name: "Passport", size: "35 × 45 mm" },
  { country: "United States", name: "Passport", size: "2 × 2 in" },
  { country: "Japan", name: "Passport", size: "35 × 45 mm" },
] as const;
