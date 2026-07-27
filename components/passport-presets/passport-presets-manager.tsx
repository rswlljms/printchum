"use client";

import { Copy, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { PassportPresetForm } from "@/components/passport-presets/passport-preset-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPhotoDimensions } from "@/features/editor/photo-sizes/conversions";
import { filterPassportPresets } from "@/lib/passport-presets/operations";
import { PASSPORT_PRESET_DISCLAIMER } from "@/lib/passport-presets/presets";
import type {
  NewPassportPreset,
  PassportPreset,
  PassportPresetFilter,
} from "@/lib/passport-presets/types";
import { useEditorStore } from "@/stores/editor-store";

export function PassportPresetsManager() {
  const presets = useEditorStore((state) => state.passportPresets);
  const favorites = useEditorStore(
    (state) => state.favoritePassportPresetIds,
  );
  const recents = useEditorStore(
    (state) => state.recentPassportPresetIds,
  );
  const createPreset = useEditorStore(
    (state) => state.createCustomPassportPreset,
  );
  const updatePreset = useEditorStore(
    (state) => state.updateCustomPassportPreset,
  );
  const duplicatePreset = useEditorStore(
    (state) => state.duplicatePassportPreset,
  );
  const removePreset = useEditorStore(
    (state) => state.removeCustomPassportPreset,
  );
  const toggleFavorite = useEditorStore(
    (state) => state.togglePassportPresetFavorite,
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] =
    useState<PassportPresetFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingPresetId, setEditingPresetId] =
    useState<string | null>(null);
  const editingPreset =
    presets.find((preset) => preset.id === editingPresetId) ?? null;
  const results = useMemo(
    () =>
      filterPassportPresets(
        presets,
        query,
        filter,
        favorites,
        recents,
      ),
    [favorites, filter, presets, query, recents],
  );
  const hasCustomPresets = presets.some((preset) => !preset.isBuiltIn);

  function submitPreset(input: NewPassportPreset): boolean {
    if (editingPreset) {
      return updatePreset(editingPreset.id, input);
    }
    return Boolean(createPreset(input));
  }

  return (
    <div className="page-enter mx-auto max-w-[1800px] p-4 sm:p-6">
      <header className="mb-8 flex flex-col justify-between gap-5 border-b border-[var(--gray-200)] pb-6 lg:flex-row lg:items-end">
        <div>
          <p className="micro-label">01 — presets</p>
          <h1 className="font-display mt-2 text-4xl leading-none">
            Passport Presets
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[var(--gray-500)]">
            Manage frontend preparation guides for country-specific passport
            photos.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditingPresetId(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          Create Custom Preset
        </Button>
      </header>

      <p className="mb-6 rounded-xl border border-[var(--gray-200)] bg-[var(--gray-50)] p-4 text-xs leading-5 text-[var(--gray-600)]">
        {PASSPORT_PRESET_DISCLAIMER}
      </p>

      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_240px]">
        <label className="text-xs font-medium">
          Search presets
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Country, code, or preset"
            className="mt-1.5 h-10 w-full rounded-md border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 text-sm"
          />
        </label>
        <label className="text-xs font-medium">
          Status and type
          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as PassportPresetFilter)
            }
            className="mt-1.5 h-10 w-full rounded-md border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 text-sm"
          >
            <option value="all">All</option>
            <option value="favorites">Favorites</option>
            <option value="built-in">Built-in</option>
            <option value="custom">Custom</option>
            <option value="verified">Verified</option>
            <option value="review-needed">Review needed</option>
          </select>
        </label>
      </div>

      {!hasCustomPresets ? (
        <section className="mb-5 rounded-xl border border-dashed border-[var(--gray-300)] p-5">
          <h2 className="font-semibold">No custom passport presets</h2>
          <p className="mt-1 text-xs text-[var(--gray-500)]">
            Create a custom passport-photo preset for studio-specific or
            regional requirements.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setFormOpen(true)}
          >
            Create Custom Preset
          </Button>
        </section>
      ) : null}

      <div className="space-y-3" aria-busy="false">
        {results.length > 0 ? (
          results.map((preset) => (
            <PresetRow
              key={preset.id}
              preset={preset}
              favorite={favorites.includes(preset.id)}
              onFavorite={() => toggleFavorite(preset.id)}
              onDuplicate={() => duplicatePreset(preset.id)}
              onEdit={() => {
                setEditingPresetId(preset.id);
                setFormOpen(true);
              }}
              onDelete={() => {
                if (
                  window.confirm(
                    `Delete the custom preset “${preset.name}”?`,
                  )
                ) {
                  removePreset(preset.id);
                }
              }}
            />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--gray-300)] p-8 text-center">
            <h2 className="font-semibold">No passport presets found</h2>
            <p className="mt-1 text-xs text-[var(--gray-500)]">
              Try another country name or create a custom preset.
            </p>
          </div>
        )}
      </div>

      <PassportPresetForm
        open={formOpen}
        preset={editingPreset}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditingPresetId(null);
          }
        }}
        onSubmit={submitPreset}
      />
    </div>
  );
}

type PresetRowProps = {
  preset: PassportPreset;
  favorite: boolean;
  onFavorite: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function PresetRow({
  preset,
  favorite,
  onFavorite,
  onDuplicate,
  onEdit,
  onDelete,
}: PresetRowProps) {
  return (
    <article className="grid gap-4 rounded-xl border border-[var(--gray-200)] bg-[var(--surface)] p-4 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold">{preset.name}</h2>
          <Badge variant="secondary">{preset.status}</Badge>
          <Badge variant="secondary">
            {preset.isBuiltIn ? "Built-in" : "Custom"}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-[var(--gray-500)]">
          {preset.countryName} · {preset.countryCode}
        </p>
      </div>
      <div className="font-technical text-[10px] uppercase text-[var(--gray-500)]">
        {formatPhotoDimensions(
          preset.width,
          preset.height,
          preset.unit,
        )}
      </div>
      <div className="text-xs text-[var(--gray-500)]">
        Background: {preset.defaultBackgroundColor ?? "No preference"}
        <br />
        Last verified: {preset.lastVerifiedAt ?? "Not verified"}
      </div>
      <div className="flex flex-wrap gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onFavorite}
          aria-label={
            favorite
              ? `Remove ${preset.name} from favorites`
              : `Add ${preset.name} to favorites`
          }
        >
          <Star className="size-3.5" fill={favorite ? "currentColor" : "none"} />
          {favorite ? "Saved" : "Favorite"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDuplicate}
        >
          <Copy className="size-3.5" />
          Duplicate
        </Button>
        {!preset.isBuiltIn ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onEdit}
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDelete}
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          </>
        ) : null}
      </div>
    </article>
  );
}
