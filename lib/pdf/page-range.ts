export type PageRangeParseResult =
  | { valid: true; pageIndexes: number[] }
  | { valid: false; error: string };

export function parsePageRange(
  input: string,
  totalPages: number,
): PageRangeParseResult {
  const value = input.trim();
  if (totalPages < 1) {
    return { valid: false, error: "There are no pages to select." };
  }
  if (!value) {
    return { valid: false, error: "Enter at least one page." };
  }
  if (!/^\d+(?:\s*-\s*\d+)?(?:\s*,\s*\d+(?:\s*-\s*\d+)?)*$/.test(value)) {
    return {
      valid: false,
      error: "Use page numbers and ranges such as 1-3,5.",
    };
  }

  const pages = new Set<number>();
  for (const segment of value.split(",")) {
    const [startText, endText] = segment.trim().split("-").map((part) => part.trim());
    const start = Number(startText);
    const end = endText === undefined ? start : Number(endText);
    if (start < 1 || end < 1) {
      return { valid: false, error: "Page numbers must start at 1." };
    }
    if (end < start) {
      return { valid: false, error: "Page ranges must be in ascending order." };
    }
    if (end > totalPages) {
      return {
        valid: false,
        error: `Page ${end} is outside the ${totalPages}-page layout.`,
      };
    }
    for (let page = start; page <= end; page += 1) {
      pages.add(page - 1);
    }
  }

  return {
    valid: true,
    pageIndexes: [...pages].sort((left, right) => left - right),
  };
}
