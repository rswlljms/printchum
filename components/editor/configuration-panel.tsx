"use client";

import { ImagePlus, Sparkles } from "lucide-react";

import { PaperSettingsPanel } from "@/components/editor/paper-settings-panel";
import { PhotoCropper } from "@/components/editor/photo-cropper";
import { PhotoSizesPanel } from "@/components/editor/photo-sizes-panel";
import { PhotoUpload } from "@/components/editor/photo-upload";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { photoSizePresets } from "@/features/editor/photo-sizes/presets";
import { serviceSets } from "@/features/editor/mock-data/service-sets";
import {
  formatServiceSetPrice,
  summarizeServiceSetItems,
} from "@/features/editor/service-set-presentation";
import { cn } from "@/lib/class-names";
import { useEditorStore } from "@/stores/editor-store";

export function ConfigurationPanel() {
  const selectedServiceSetId = useEditorStore((state) => state.selectedServiceSetId);
  const selectServiceSet = useEditorStore((state) => state.selectServiceSet);

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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-[var(--ink)]" />
              <div>
                <p className="micro-label">02 — package</p>
                <h2 className="mt-1 font-semibold text-[var(--ink)]">Service set</h2>
              </div>
            </div>
            <span className="font-technical text-[9px] uppercase tracking-wider text-[var(--gray-500)]">
              Tap to apply
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {serviceSets.map((serviceSet) => {
              const itemSummaries = summarizeServiceSetItems(
                serviceSet,
                photoSizePresets,
              );

              return (
                <button
                  key={serviceSet.id}
                  type="button"
                  onClick={() => selectServiceSet(serviceSet.id)}
                  className={cn(
                    "min-h-24 rounded-xl border px-3 py-3 text-left transition-transform duration-200 hover:-translate-y-px",
                    selectedServiceSetId === serviceSet.id
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--inverted-ink)]"
                      : "border-[var(--gray-200)] bg-[var(--surface)] hover:bg-[var(--gray-50)]",
                  )}
                  aria-pressed={selectedServiceSetId === serviceSet.id}
                >
                  <span className="font-technical block text-[10px] font-semibold uppercase tracking-wider">
                    {serviceSet.name}
                  </span>
                  <span className="mt-1 block text-xs font-semibold">
                    {formatServiceSetPrice(serviceSet)}
                  </span>
                  <span className="mt-1.5 block space-y-0.5">
                    {itemSummaries.map((summary) => (
                      <span
                        key={summary.key}
                        className="font-technical block text-[9px] leading-4 opacity-70"
                      >
                        {summary.text}
                      </span>
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <PaperSettingsPanel />

      <Card>
        <CardHeader>
          <p className="micro-label">05 — background</p>
          <h2 className="mt-1 font-semibold text-[var(--ink)]">Background</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-xl border border-[var(--gray-200)] bg-[var(--gray-50)] p-3">
            <div>
              <p className="text-sm font-medium text-[var(--gray-700)]">Original background</p>
              <p className="text-xs text-[var(--gray-500)]">AI removal is not active.</p>
            </div>
            <Badge variant="secondary">Placeholder</Badge>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
