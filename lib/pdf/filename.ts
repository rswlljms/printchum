function timestampParts(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}-${hours}${minutes}`;
}

export function createDefaultPdfFilename(date = new Date()): string {
  return `printchum-layout-${timestampParts(date)}.pdf`;
}

export function sanitizePdfFilename(
  input: string,
  fallback = createDefaultPdfFilename(),
): string {
  const withoutExtension = input
    .trim()
    .replace(/(?:\.pdf)+$/i, "")
    .replace(/[\u0000-\u001f\u007f<>:"/\\|?*]+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/-+/g, "-")
    .replace(/^[.\s-]+|[.\s-]+$/g, "")
    .slice(0, 120);
  if (!withoutExtension) {
    return fallback.toLowerCase().endsWith(".pdf")
      ? fallback
      : `${fallback}.pdf`;
  }
  return `${withoutExtension}.pdf`;
}
