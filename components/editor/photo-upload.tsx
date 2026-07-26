"use client";

import { ImagePlus, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import {
  type ChangeEvent,
  type DragEvent,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { validatePhotoFile } from "@/features/editor/photo-validation";
import { cn } from "@/lib/class-names";
import { useEditorStore } from "@/stores/editor-store";

const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";

export function PhotoUpload() {
  const sourceObjectUrl = useEditorStore((state) => state.sourceObjectUrl);
  const replaceSourcePhoto = useEditorStore((state) => state.replaceSourcePhoto);
  const removeSourcePhoto = useEditorStore((state) => state.removeSourcePhoto);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function selectPhoto(file: File | undefined): void {
    if (!file) {
      return;
    }

    const validation = validatePhotoFile(file);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setError(null);
    replaceSourcePhoto(file);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    selectPhoto(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    setIsDragging(false);
    selectPhoto(event.dataTransfer.files[0]);
  }

  function openFilePicker(): void {
    inputRef.current?.click();
  }

  function handleRemove(): void {
    setError(null);
    removeSourcePhoto();
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept={PHOTO_ACCEPT}
        onChange={handleInputChange}
        aria-label="Choose a local photo"
      />

      {sourceObjectUrl ? (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-[var(--gray-200)] bg-[var(--gray-50)]">
            {/* Blob URLs are local session resources and are not compatible with Next image optimization. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sourceObjectUrl}
              alt="Selected photo preview"
              className="h-44 w-full object-contain"
              onError={() => {
                setError("The image could not be opened. Try another JPEG, PNG, or WebP photo.");
                removeSourcePhoto();
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={openFilePicker}>
              <RefreshCw className="size-4" />
              Replace
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleRemove}>
              <Trash2 className="size-4" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setIsDragging(false);
            }
          }}
          onDrop={handleDrop}
          className={cn(
            "rounded-xl border border-dashed p-5 text-center transition-colors",
            isDragging
              ? "border-[var(--ink)] bg-[var(--gray-100)]"
              : "border-[var(--gray-300)] bg-[var(--gray-50)]",
          )}
        >
          <div className="mx-auto flex size-10 items-center justify-center rounded-lg border border-[var(--gray-200)] bg-[var(--surface)]">
            {isDragging ? (
              <ImagePlus className="size-4 text-[var(--ink)]" />
            ) : (
              <UploadCloud className="size-4 text-[var(--ink)]" />
            )}
          </div>
          <p className="mt-3 text-sm font-medium text-[var(--gray-700)]">
            Drop a photo here
          </p>
          <p className="mt-1 text-xs text-[var(--gray-500)]">
            JPEG, PNG, or WebP · up to 15 MB
          </p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={openFilePicker}>
            Choose photo
          </Button>
        </div>
      )}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}

    </div>
  );
}
