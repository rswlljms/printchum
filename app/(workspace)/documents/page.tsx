import type { Metadata } from "next";

import { DocumentWorkspace } from "@/components/documents/document-workspace";

export const metadata: Metadata = {
  title: "Documents",
  description: "A new workspace for local document printing in PrintChum. Coming soon.",
};

export default function DocumentsPage() {
  return <DocumentWorkspace />;
}
