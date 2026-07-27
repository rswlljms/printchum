"use client";

import { ImagePlus } from "lucide-react";

import { PaperSettingsPanel } from "@/components/editor/paper-settings-panel";
import { PhotoCropper } from "@/components/editor/photo-cropper";
import { PhotoSizesPanel } from "@/components/editor/photo-sizes-panel";
import { PhotoUpload } from "@/components/editor/photo-upload";
import { ServiceSetSelector } from "@/components/editor/service-set-selector";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ConfigurationPanel() {
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
    </aside>
  );
}
