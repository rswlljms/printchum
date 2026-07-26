"use client";

import { ImagePlus, ScanLine, Sparkles } from "lucide-react";

import { PhotoCropper } from "@/components/editor/photo-cropper";
import { PhotoUpload } from "@/components/editor/photo-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { paperPresets } from "@/features/editor/mock-data/paper-presets";
import { serviceSets } from "@/features/editor/mock-data/service-sets";
import { cn } from "@/lib/class-names";
import { useEditorStore } from "@/stores/editor-store";

export function ConfigurationPanel() {
  const paper = useEditorStore((state) => state.paper);
  const selectedServiceSetId = useEditorStore((state) => state.selectedServiceSetId);
  const selectPaperPreset = useEditorStore((state) => state.selectPaperPreset);
  const selectServiceSet = useEditorStore((state) => state.selectServiceSet);
  const setPaperOrientation = useEditorStore((state) => state.setPaperOrientation);

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
            <Badge variant="secondary">Mock data</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {serviceSets.map((serviceSet) => (
              <button
                key={serviceSet.id}
                type="button"
                onClick={() => selectServiceSet(serviceSet.id)}
                className={cn(
                  "rounded-lg border px-2 py-2.5 text-left transition-transform duration-200 hover:-translate-y-px",
                  selectedServiceSetId === serviceSet.id
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--inverted-ink)]"
                    : "border-[var(--gray-200)] bg-[var(--surface)] hover:bg-[var(--gray-50)]",
                )}
                aria-pressed={selectedServiceSetId === serviceSet.id}
              >
                <span className="font-technical block text-[10px] font-semibold uppercase tracking-wider">{serviceSet.name}</span>
                <span className="font-technical mt-0.5 block text-[9px] opacity-65">${serviceSet.price}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ScanLine className="size-4 text-[var(--ink)]" />
            <div>
              <p className="micro-label">03 — output</p>
              <h2 className="mt-1 font-semibold text-[var(--ink)]">Paper</h2>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {paperPresets.filter((preset) => preset.id !== "custom").map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectPaperPreset(preset)}
                className={cn(
                  "font-technical rounded-lg border px-3 py-2 text-left text-[10px] uppercase tracking-wide",
                  paper.id === preset.id
                    ? "border-[var(--ink)] bg-[var(--ink)] font-medium text-[var(--inverted-ink)]"
                    : "border-[var(--gray-200)] text-[var(--gray-600)] hover:bg-[var(--gray-50)]",
                )}
                aria-pressed={paper.id === preset.id}
              >
                {preset.name}
              </button>
            ))}
          </div>
          <div>
            <p className="micro-label mb-2">Orientation</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={paper.orientation === "portrait" ? "subtle" : "outline"}
                size="sm"
                onClick={() => setPaperOrientation("portrait")}
                aria-pressed={paper.orientation === "portrait"}
              >
                Portrait
              </Button>
              <Button
                variant={paper.orientation === "landscape" ? "subtle" : "outline"}
                size="sm"
                onClick={() => setPaperOrientation("landscape")}
                aria-pressed={paper.orientation === "landscape"}
              >
                Landscape
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <p className="micro-label">04 — background</p>
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
