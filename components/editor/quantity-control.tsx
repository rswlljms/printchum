"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type QuantityControlProps = {
  itemId: string;
  itemName: string;
  quantity: number;
  onChange: (quantity: number) => void;
};

export function QuantityControl({
  itemId,
  itemName,
  quantity,
  onChange,
}: QuantityControlProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8"
        onClick={() => onChange(quantity - 1)}
        disabled={quantity <= 1}
        aria-label={`Decrease quantity for ${itemName}`}
      >
        <Minus className="size-3" />
      </Button>
      <label className="sr-only" htmlFor={`quantity-${itemId}`}>
        Quantity for {itemName}
      </label>
      <input
        id={`quantity-${itemId}`}
        className="font-technical h-8 w-12 rounded-md border border-[var(--gray-200)] bg-[var(--gray-50)] px-1 text-center text-xs text-[var(--ink)]"
        type="number"
        inputMode="numeric"
        min={1}
        max={500}
        step={1}
        value={quantity}
        onChange={(event) => {
          const nextQuantity = Number(event.target.value);
          if (Number.isInteger(nextQuantity)) {
            onChange(nextQuantity);
          }
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8"
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= 500}
        aria-label={`Increase quantity for ${itemName}`}
      >
        <Plus className="size-3" />
      </Button>
    </div>
  );
}
