import { Coffee } from "lucide-react";

import { Button } from "@/components/ui/button";

const kofiUrl = "https://ko-fi.com/rswlljms";

export function KofiButton() {
  return (
    <Button
      asChild
      size="sm"
      className="gap-1.5 rounded-full px-2.5 tracking-[0.1em] sm:px-3"
    >
      <a
        href={kofiUrl}
        target="_blank"
        rel="noreferrer noopener"
        title="Buy me a coffee on Ko-fi"
        aria-label="Buy me a coffee on Ko-fi, opens in a new tab"
      >
        <Coffee className="size-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Buy me a coffee</span>
      </a>
    </Button>
  );
}
