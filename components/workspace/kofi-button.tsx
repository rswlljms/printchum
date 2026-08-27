import { Coffee } from "lucide-react";

import { Button } from "@/components/ui/button";

const kofiUrl = "https://ko-fi.com/printchum";

export function KofiButton() {
  return (
    <Button
      asChild
      variant="subtle"
      size="sm"
      className="gap-1.5 rounded-full px-2.5 tracking-[0.1em] sm:px-3"
    >
      <a
        href={kofiUrl}
        target="_blank"
        rel="noreferrer noopener"
        title="Support PrintChum on Ko-fi"
        aria-label="Support PrintChum on Ko-fi, opens in a new tab"
      >
        <Coffee className="size-3.5" aria-hidden="true" />
        <span>Support PrintChum</span>
      </a>
    </Button>
  );
}
