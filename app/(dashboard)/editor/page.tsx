import type { Metadata } from "next";

import { EditorWorkspace } from "@/components/editor/editor-workspace";

export const metadata: Metadata = {
  title: "Create Layout",
};

export default function EditorPage() {
  return <EditorWorkspace />;
}
