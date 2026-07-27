"use client";

import { Images, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { PhotoSizeDialog } from "@/components/editor/photo-size-dialog";
import { PhotoSizeItem } from "@/components/editor/photo-size-item";
import { PhotoSizeSelector } from "@/components/editor/photo-size-selector";
import { NameplateEditor } from "@/components/editor/nameplate-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  PHOTO_SIZE_DEFAULT_QUANTITY,
  findPhotoSizePreset,
} from "@/features/editor/photo-sizes/presets";
import type { PhotoSizeFormInput, PhotoSizeFormValues } from "@/features/editor/photo-sizes/schemas";
import type { NewPhotoSizeItem } from "@/features/editor/types";
import { useEditorStore } from "@/stores/editor-store";

const customSizeDefaults: PhotoSizeFormInput = {
  name: "Custom size",
  width: 2,
  height: 2,
  unit: "in",
  quantity: PHOTO_SIZE_DEFAULT_QUANTITY,
  allowRotation: false,
  nameplateEnabled: false,
};

function toNewPhotoSizeItem(
  values: PhotoSizeFormValues,
  presetId?: string,
): NewPhotoSizeItem {
  return {
    presetId,
    name: values.name,
    width: values.width,
    height: values.height,
    unit: values.unit,
    quantity: values.quantity,
    allowRotation: false,
    nameplateEnabled: values.nameplateEnabled,
  };
}

export function PhotoSizesPanel() {
  const photoSizes = useEditorStore((state) => state.photoSizes);
  const addPhotoSizeFromPreset = useEditorStore(
    (state) => state.addPhotoSizeFromPreset,
  );
  const addCustomPhotoSize = useEditorStore(
    (state) => state.addCustomPhotoSize,
  );
  const updatePhotoSize = useEditorStore((state) => state.updatePhotoSize);
  const duplicatePhotoSize = useEditorStore(
    (state) => state.duplicatePhotoSize,
  );
  const removePhotoSize = useEditorStore((state) => state.removePhotoSize);
  const setPhotoSizeQuantity = useEditorStore(
    (state) => state.setPhotoSizeQuantity,
  );
  const clearPhotoSizes = useEditorStore((state) => state.clearPhotoSizes);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [nameplateItemId, setNameplateItemId] = useState<string | null>(
    null,
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const returnFocusElement = useRef<HTMLElement | null>(null);
  const editingItem = photoSizes.find((item) => item.id === editingItemId);
  const editDefaults = useMemo<PhotoSizeFormInput | null>(
    () =>
      editingItem
        ? {
            name: editingItem.name,
            width: editingItem.width,
            height: editingItem.height,
            unit: editingItem.unit,
            quantity: editingItem.quantity,
            allowRotation: false,
            nameplateEnabled: editingItem.nameplateEnabled,
          }
        : null,
    [editingItem],
  );

  useEffect(() => {
    if (!feedback) {
      return;
    }
    const timeout = window.setTimeout(() => setFeedback(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  function addPreset(presetId: string): void {
    const preset = findPhotoSizePreset(presetId);
    addPhotoSizeFromPreset(presetId);
    setFeedback(`${preset?.name ?? "Photo size"} added.`);
  }

  function rememberDialogTrigger(): void {
    returnFocusElement.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
  }

  function restoreDialogTriggerFocus(): void {
    window.requestAnimationFrame(() => returnFocusElement.current?.focus());
  }

  function openCustomDialog(): void {
    rememberDialogTrigger();
    setCustomDialogOpen(true);
  }

  function closeCustomDialog(open: boolean): void {
    setCustomDialogOpen(open);
    if (!open) {
      restoreDialogTriggerFocus();
    }
  }

  function openEditDialog(itemId: string): void {
    rememberDialogTrigger();
    setEditingItemId(itemId);
  }

  function duplicateItem(itemId: string): void {
    duplicatePhotoSize(itemId);
    setFeedback("Photo size duplicated.");
  }

  function removeItem(itemId: string): void {
    removePhotoSize(itemId);
    setFeedback("Photo size removed.");
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Images className="size-4 text-[var(--ink)]" />
              <div>
                <p className="micro-label">03 — sizes</p>
                <h2 className="mt-1 font-semibold text-[var(--ink)]">
                  Photo sizes
                </h2>
              </div>
            </div>
            {photoSizes.length > 0 ? (
              <button
                type="button"
                className="font-technical text-[9px] uppercase tracking-wider text-[var(--gray-500)] hover:text-[var(--ink)]"
                onClick={() => {
                  clearPhotoSizes();
                  setFeedback("All photo sizes cleared.");
                }}
              >
                Clear all
              </button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {feedback ? (
            <div
              className="rounded-lg border border-[var(--gray-300)] bg-[var(--ink)] px-3 py-2 text-xs text-[var(--inverted-ink)]"
              role="status"
            >
              {feedback}
            </div>
          ) : null}

          <PhotoSizeSelector
            onAddPreset={addPreset}
            onAddCustom={openCustomDialog}
          />

          <div className="border-t border-[var(--gray-200)] pt-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="micro-label">Selected</p>
              <span className="font-technical text-[9px] uppercase tracking-wider text-[var(--gray-500)]">
                {photoSizes.length} size {photoSizes.length === 1 ? "type" : "types"}
              </span>
            </div>

            {photoSizes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--gray-300)] bg-[var(--gray-50)] p-4 text-center">
                <h3 className="text-sm font-semibold text-[var(--ink)]">
                  No photo sizes selected
                </h3>
                <p className="mt-1 text-xs leading-5 text-[var(--gray-500)]">
                  Choose a standard size or add a custom size to generate a print layout.
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  <Button type="button" size="sm" onClick={() => addPreset("2x2")}>
                    <Plus className="size-3" />
                    Add 2 × 2
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openCustomDialog}
                  >
                    Add custom
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {photoSizes.map((item) => (
                  <PhotoSizeItem
                    key={item.id}
                    item={item}
                    onEdit={openEditDialog}
                    onDuplicate={duplicateItem}
                    onRemove={removeItem}
                    onQuantityChange={setPhotoSizeQuantity}
                    onConfigureNameplate={setNameplateItemId}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <PhotoSizeDialog
        open={customDialogOpen}
        mode="add"
        defaultValues={customSizeDefaults}
        onOpenChange={closeCustomDialog}
        onSubmit={(values) => {
          addCustomPhotoSize(toNewPhotoSizeItem(values));
          setFeedback(`${values.name} added.`);
        }}
      />

      {editingItem && editDefaults ? (
        <PhotoSizeDialog
          key={editingItem.id}
          open
          mode="edit"
          defaultValues={editDefaults}
          onOpenChange={(open) => {
            if (!open) {
              setEditingItemId(null);
              restoreDialogTriggerFocus();
            }
          }}
          onSubmit={(values) => {
            updatePhotoSize(editingItem.id, {
              name: values.name,
              width: values.width,
              height: values.height,
              unit: values.unit,
              quantity: values.quantity,
              allowRotation: false,
              nameplateEnabled: values.nameplateEnabled,
            });
            setFeedback(`${values.name} updated.`);
            setEditingItemId(null);
          }}
        />
      ) : null}

      <NameplateEditor
        item={
          photoSizes.find((item) => item.id === nameplateItemId) ?? null
        }
        onOpenChange={(open) => {
          if (!open) {
            setNameplateItemId(null);
          }
        }}
      />
    </>
  );
}
