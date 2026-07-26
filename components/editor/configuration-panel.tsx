"use client";

import { ImagePlus } from "lucide-react";

import { PaperSettingsPanel } from "@/components/editor/paper-settings-panel";
import { PhotoCropper } from "@/components/editor/photo-cropper";
import { PhotoSizesPanel } from "@/components/editor/photo-sizes-panel";
import { PhotoUpload } from "@/components/editor/photo-upload";
import { ServiceSetSelector } from "@/components/editor/service-set-selector";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEditorStore } from "@/stores/editor-store";

export function ConfigurationPanel() {
  const backgroundMode = useEditorStore((state) => state.backgroundMode);
  const backgroundColor = useEditorStore((state) => state.backgroundColor);
  const setBackgroundPreference = useEditorStore(
    (state) => state.setBackgroundPreference,
  );

  return (
    <aside className="space-y-4" aria-label="Layout configuration">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImagePlus className="size-4 text-[var(--ink)]" />
            <div>
              <p className="micro-label">01 — source</p>
              <h2 className="mt-1 font-semibold text-[var(--ink)]">Photo</h2>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PhotoUpload />
          <div className="mt-5 border-t border-[var(--gray-200)] pt-5">
            <PhotoCropper />
          </div>
        </CardContent>
      </Card>

      <PhotoSizesPanel />

      <ServiceSetSelector />

      <PaperSettingsPanel />

      <Card>
        <CardHeader>
          <p className="micro-label">05 — background</p>
          <h2 className="mt-1 font-semibold text-[var(--ink)]">Background</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <label className="block text-xs font-medium text-[var(--gray-700)]">
              Background preference
              <select
                value={backgroundMode}
                onChange={(event) => {
                  const mode = event.target.value;
                  if (mode === "solid") {
                    setBackgroundPreference({
                      mode,
                      color: backgroundColor,
                    });
                  } else if (
                    mode === "original" ||
                    mode === "transparent"
                  ) {
                    setBackgroundPreference({ mode });
                  }
                }}
                className="mt-1.5 h-10 w-full rounded-md border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 text-sm"
              >
                <option value="original">Original</option>
                <option value="transparent">Transparent</option>
                <option value="solid">Solid color</option>
              </select>
            </label>
            {backgroundMode === "solid" ? (
              <label className="block text-xs font-medium text-[var(--gray-700)]">
                Solid color
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(event) =>
                    setBackgroundPreference({
                      mode: "solid",
                      color: event.target.value,
                    })
                  }
                  className="mt-1.5 h-10 w-full rounded-md border border-[var(--gray-200)] bg-[var(--gray-50)] p-1"
                />
              </label>
            ) : null}
            {backgroundMode === "transparent" ? (
              <p className="text-xs leading-5 text-[var(--gray-500)]">
                Transparent output requires background removal when the AI
                integration is connected.
              </p>
            ) : null}
            <Badge variant="secondary">Preference only</Badge>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
