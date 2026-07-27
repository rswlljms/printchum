"use client";

import { FileImage, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";

import { PassportPresetDetailDialog } from "@/components/editor/passport-preset-detail-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatPhotoDimensions } from "@/features/editor/photo-sizes/conversions";
import { filterPassportPresets } from "@/lib/passport-presets/operations";
import { PASSPORT_PRESET_DISCLAIMER } from "@/lib/passport-presets/presets";
import type {
  PassportPresetFilter,
} from "@/lib/passport-presets/types";
import { useEditorStore } from "@/stores/editor-store";

const filters: readonly {
  value: PassportPresetFilter;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "favorites", label: "Favorites" },
  { value: "recent", label: "Recent" },
  { value: "built-in", label: "Built-in" },
  { value: "custom", label: "Custom" },
  { value: "verified", label: "Verified" },
  { value: "review-needed", label: "Review needed" },
];

export function PassportPresetSelector() {
  const presets = useEditorStore((state) => state.passportPresets);
  const hasPassportItem = useEditorStore((state) =>
    state.photoSizes.some((item) => Boolean(item.passportPresetId)),
  );
  const favoriteIds = useEditorStore(
    (state) => state.favoritePassportPresetIds,
  );
  const recentIds = useEditorStore(
    (state) => state.recentPassportPresetIds,
  );
  const applyPassportPreset = useEditorStore(
    (state) => state.applyPassportPreset,
  );
  const toggleFavorite = useEditorStore(
    (state) => state.togglePassportPresetFavorite,
  );
  const duplicatePreset = useEditorStore(
    (state) => state.duplicatePassportPreset,
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] =
    useState<PassportPresetFilter>("all");
  const [detailPresetId, setDetailPresetId] =
    useState<string | null>(null);
  const results = useMemo(
    () =>
      filterPassportPresets(
        presets,
        query,
        filter,
        favoriteIds,
        recentIds,
      ),
    [favoriteIds, filter, presets, query, recentIds],
  );
  const detailPreset =
    presets.find((preset) => preset.id === detailPresetId) ?? null;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileImage className="size-4" />
            <div>
              <p className="micro-label">02 — passport</p>
              <h2 className="mt-1 font-semibold text-[var(--ink)]">
                Passport Presets
              </h2>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="block text-xs font-medium">
            Search passport presets
            <span className="relative mt-1.5 block">
              <Search className="pointer-events-none absolute left-3 top-3 size-3.5 text-[var(--gray-500)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-10 w-full rounded-md border border-[var(--gray-200)] bg-[var(--gray-50)] pl-9 pr-3 text-sm"
                placeholder="Country, code, or preset"
              />
            </span>
          </label>
          <label className="block text-xs font-medium">
            Filter
            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as PassportPresetFilter)
              }
              className="mt-1.5 h-10 w-full rounded-md border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 text-sm"
            >
              {filters.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {results.length > 0 ? (
              results.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="w-full rounded-lg border border-[var(--gray-200)] bg-[var(--surface)] p-3 text-left hover:bg-[var(--gray-50)]"
                  onClick={() => setDetailPresetId(preset.id)}
                  aria-label={`Open ${preset.name} details`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span>
                      <span className="block text-xs font-semibold">
                        {preset.countryName}
                      </span>
                      <span className="font-technical mt-1 block text-[9px] uppercase text-[var(--gray-500)]">
                        {formatPhotoDimensions(
                          preset.width,
                          preset.height,
                          preset.unit,
                        )}
                      </span>
                    </span>
                    {favoriteIds.includes(preset.id) ? (
                      <Star
                        className="size-3.5"
                        fill="currentColor"
                        aria-label="Favorite"
                      />
                    ) : null}
                  </span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="secondary">{preset.status}</Badge>
                    <Badge variant="secondary">
                      {preset.isBuiltIn ? "Built-in" : "Custom"}
                    </Badge>
                  </span>
                </button>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--gray-300)] p-4 text-center">
                <p className="text-sm font-semibold">
                  No passport presets found
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--gray-500)]">
                  Try another country name or create a custom preset.
                </p>
              </div>
            )}
          </div>
          <p className="border-t border-[var(--gray-200)] pt-3 text-[11px] leading-5 text-[var(--gray-500)]">
            {PASSPORT_PRESET_DISCLAIMER}
          </p>
        </CardContent>
      </Card>

      <PassportPresetDetailDialog
        preset={detailPreset}
        hasPassportItem={hasPassportItem}
        favorite={
          detailPreset
            ? favoriteIds.includes(detailPreset.id)
            : false
        }
        onOpenChange={(open) => {
          if (!open) {
            setDetailPresetId(null);
          }
        }}
        onApply={(presetId, mode) => {
          applyPassportPreset(presetId, mode);
          setDetailPresetId(null);
        }}
        onDuplicate={(presetId) => {
          duplicatePreset(presetId);
          setDetailPresetId(null);
        }}
        onToggleFavorite={toggleFavorite}
      />
    </>
  );
}
