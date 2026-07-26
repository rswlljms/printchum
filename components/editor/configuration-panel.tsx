"use client";

import { ImagePlus, ScanLine, Sparkles } from "lucide-react";

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
            <ImagePlus className="size-4 text-blue-600" />
            <h2 className="font-semibold text-slate-900">Photo</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-[10px] border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
            <p className="text-sm font-medium text-slate-700">Photo upload arrives in Phase 2</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              No customer photo is uploaded or stored in this foundation.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-blue-600" />
              <h2 className="font-semibold text-slate-900">Service set</h2>
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
                  "rounded-[10px] border px-2 py-2.5 text-left",
                  selectedServiceSetId === serviceSet.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white hover:bg-slate-50",
                )}
                aria-pressed={selectedServiceSetId === serviceSet.id}
              >
                <span className="block text-xs font-semibold text-slate-800">{serviceSet.name}</span>
                <span className="mt-0.5 block text-[11px] text-slate-500">${serviceSet.price}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ScanLine className="size-4 text-blue-600" />
            <h2 className="font-semibold text-slate-900">Paper</h2>
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
                  "rounded-[10px] border px-3 py-2 text-left text-xs",
                  paper.id === preset.id
                    ? "border-blue-500 bg-blue-50 font-medium text-blue-800"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50",
                )}
                aria-pressed={paper.id === preset.id}
              >
                {preset.name}
              </button>
            ))}
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-slate-600">Orientation</p>
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
          <h2 className="font-semibold text-slate-900">Background</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-[10px] bg-slate-50 p-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Original background</p>
              <p className="text-xs text-slate-500">AI removal is not active.</p>
            </div>
            <Badge variant="secondary">Placeholder</Badge>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
