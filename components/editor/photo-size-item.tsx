"use client";

import { Copy, Pencil, Tag, Trash2 } from "lucide-react";

import { QuantityControl } from "@/components/editor/quantity-control";
import { Button } from "@/components/ui/button";
import { formatPhotoDimensions } from "@/features/editor/photo-sizes/conversions";
import type { PhotoSizeItem as PhotoSizeItemType } from "@/features/editor/types";

type PhotoSizeItemProps = {
  item: PhotoSizeItemType;
  onDuplicate: (itemId: string) => void;
  onEdit: (itemId: string) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  onConfigureNameplate: (itemId: string) => void;
};

export function PhotoSizeItem({
  item,
  onDuplicate,
  onEdit,
  onQuantityChange,
  onRemove,
  onConfigureNameplate,
}: PhotoSizeItemProps) {
  return (
    <article
      className="rounded-xl border border-[var(--gray-200)] bg-[var(--gray-50)] p-3"
      data-photo-size-id={item.id}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-xs font-semibold text-[var(--ink)]">
            {item.name}
          </h4>
          <p className="font-technical mt-1 text-[9px] uppercase tracking-wide text-[var(--gray-500)]">
            {formatPhotoDimensions(item.width, item.height, item.unit)}
          </p>
        </div>
        <QuantityControl
          itemId={item.id}
          itemName={item.name}
          quantity={item.quantity}
          onChange={(quantity) => onQuantityChange(item.id, quantity)}
        />
      </div>

      <div className="mt-3">
        <Button
          type="button"
          variant={item.nameplateEnabled ? "default" : "outline"}
          size="sm"
          className="w-full"
          onClick={() => onConfigureNameplate(item.id)}
          aria-label={`Configure nameplate for ${item.name}`}
        >
          <Tag className="size-3.5" />
          Nameplate {item.nameplateEnabled ? "on" : "off"}
        </Button>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 border-t border-[var(--gray-200)] pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(item.id)}
          aria-label={`Edit ${item.name}`}
        >
          <Pencil className="size-3" />
          Edit
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDuplicate(item.id)}
          aria-label={`Duplicate ${item.name}`}
        >
          <Copy className="size-3" />
          Copy
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name}`}
        >
          <Trash2 className="size-3" />
          Remove
        </Button>
      </div>
    </article>
  );
}
