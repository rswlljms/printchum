"use client";

import { Eye, PackagePlus, RefreshCcw, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { ServiceSetForm } from "@/components/service-sets/service-set-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatServiceSetPrice,
  summarizeServiceSetItems,
} from "@/features/editor/service-set-presentation";
import { findPaperPreset } from "@/lib/paper/presets";
import type { ServiceSet } from "@/lib/service-sets/types";
import { cn } from "@/lib/class-names";
import { useEditorStore } from "@/stores/editor-store";

function paperName(serviceSet: ServiceSet): string {
  return serviceSet.paper.source === "custom"
    ? serviceSet.paper.name
    : findPaperPreset(serviceSet.paper.presetId)?.name ?? "Unknown paper";
}

function backgroundLabel(serviceSet: ServiceSet): string {
  if (serviceSet.background.mode === "solid") {
    return `Solid ${serviceSet.background.color}`;
  }
  return serviceSet.background.mode;
}

export function ServiceSetSelector() {
  const serviceSets = useEditorStore((state) => state.serviceSets);
  const selectedServiceSetId = useEditorStore(
    (state) => state.selectedServiceSetId,
  );
  const modificationState = useEditorStore(
    (state) => state.serviceSetModificationState,
  );
  const photoSizes = useEditorStore((state) => state.photoSizes);
  const paper = useEditorStore((state) => state.paper);
  const applyServiceSet = useEditorStore((state) => state.applyServiceSet);
  const reapplySelectedServiceSet = useEditorStore(
    (state) => state.reapplySelectedServiceSet,
  );
  const createServiceSet = useEditorStore(
    (state) => state.createServiceSet,
  );
  const removeServiceSet = useEditorStore(
    (state) => state.removeServiceSet,
  );
  const [previewSet, setPreviewSet] = useState<ServiceSet | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceSet | null>(null);
  const [confirmationSet, setConfirmationSet] =
    useState<ServiceSet | null>(null);
  const [createFormOpen, setCreateFormOpen] = useState(false);

  const enabledSets = useMemo(
    () =>
      serviceSets
        .filter((serviceSet) => serviceSet.status === "enabled")
        .sort((left, right) => {
          if (left.isDefault !== right.isDefault) {
            return left.isDefault ? -1 : 1;
          }
          return left.displayOrder - right.displayOrder;
        }),
    [serviceSets],
  );
  const selectedSet = serviceSets.find(
    (serviceSet) => serviceSet.id === selectedServiceSetId,
  );

  function requestApply(serviceSet: ServiceSet): void {
    setPreviewSet(null);
    const hasExistingConfiguration =
      photoSizes.length > 0 ||
      paper.presetId !== "letter" ||
      paper.orientation !== "portrait" ||
      paper.margin !== 0.25 ||
      paper.horizontalSpacing !== 0 ||
      paper.verticalSpacing !== 0;
    if (hasExistingConfiguration) {
      setConfirmationSet(serviceSet);
      return;
    }
    applyServiceSet(serviceSet.id);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-[var(--ink)]" />
              <div>
                <p className="micro-label">03 — package</p>
                <h2 className="mt-1 font-semibold text-[var(--ink)]">
                  Service set
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCreateFormOpen(true)}
              className="font-technical text-[9px] uppercase tracking-wider text-[var(--gray-500)] hover:text-[var(--ink)]"
              title="Create a custom Service Set"
            >
              Custom set →
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedSet ? (
            <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-[var(--ink)] bg-[var(--gray-50)] px-3 py-2">
              <div>
                <p className="text-xs font-semibold text-[var(--ink)]">
                  {selectedSet.name}
                  {modificationState === "modified" ? " · Modified" : " applied"}
                </p>
                <p className="font-technical mt-1 text-[9px] uppercase text-[var(--gray-500)]">
                  {formatServiceSetPrice(selectedSet)}
                </p>
              </div>
              {modificationState === "modified" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    reapplySelectedServiceSet();
                  }}
                >
                  <RefreshCcw className="size-3" />
                  Reapply
                </Button>
              ) : null}
            </div>
          ) : null}

          {enabledSets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--gray-300)] p-4 text-center">
              <p className="text-sm font-semibold text-[var(--ink)]">
                No Service Sets available
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--gray-500)]">
                Add photo sizes and use Custom set above to save this layout
                as a reusable package.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {enabledSets.map((serviceSet) => {
                const itemSummaries = summarizeServiceSetItems(serviceSet);
                const totalCopies = serviceSet.photoItems.reduce(
                  (total, item) => total + item.quantity,
                  0,
                );
                const selected = selectedServiceSetId === serviceSet.id;
                return (
                  <button
                    key={serviceSet.id}
                    type="button"
                    onClick={() => setPreviewSet(serviceSet)}
                    className={cn(
                      "min-h-32 rounded-xl border px-3 py-3 text-left transition-transform duration-200 hover:-translate-y-px",
                      selected
                        ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--inverted-ink)]"
                        : "border-[var(--gray-200)] bg-[var(--surface)] hover:bg-[var(--gray-50)]",
                    )}
                    aria-pressed={selected}
                    aria-label={`Review ${serviceSet.name}`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-technical text-[10px] font-semibold uppercase tracking-wider">
                        {serviceSet.name}
                      </span>
                      {serviceSet.isDefault ? (
                        <span className="rounded-full border px-1.5 py-0.5 font-technical text-[8px] uppercase">
                          Default
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-xs font-semibold">
                      {formatServiceSetPrice(serviceSet)}
                    </span>
                    <span className="font-technical mt-1 block text-[8px] uppercase opacity-65">
                      {serviceSet.photoItems.length} sizes · {totalCopies} photos
                    </span>
                    <span className="mt-1.5 block space-y-0.5">
                      {itemSummaries.slice(0, 2).map((summary) => (
                        <span
                          key={summary.key}
                          className="font-technical block text-[8px] leading-4 opacity-70"
                        >
                          {summary.text}
                        </span>
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(previewSet)}
        onOpenChange={(open) => !open && setPreviewSet(null)}
      >
        {previewSet ? (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <p className="micro-label">Service Set details</p>
              <DialogTitle>{previewSet.name}</DialogTitle>
              <DialogDescription>
                {previewSet.description ?? "Reusable studio package."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--gray-200)] p-4">
                <p className="micro-label">Included sizes</p>
                <dl className="mt-3 space-y-2">
                  {previewSet.photoItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between gap-3 text-xs"
                    >
                      <dt>{item.name}</dt>
                      <dd className="font-technical">
                        {item.quantity} pcs
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <dl className="divide-y divide-[var(--gray-200)] rounded-xl border border-[var(--gray-200)] px-4">
                {[
                  ["Price", formatServiceSetPrice(previewSet)],
                  ["Paper", paperName(previewSet)],
                  ["Orientation", previewSet.paper.orientation],
                  [
                    "Margin",
                    `${previewSet.paper.margin} ${previewSet.paper.unit}`,
                  ],
                  [
                    "Spacing",
                    `${previewSet.paper.horizontalSpacing} × ${previewSet.paper.verticalSpacing} ${previewSet.paper.unit}`,
                  ],
                  ["Background", backgroundLabel(previewSet)],
                  [
                    "Guides / labels",
                    `${previewSet.cuttingGuidesEnabled ? "On" : "Off"} / ${
                      previewSet.sizeLabelsEnabled ? "On" : "Off"
                    }`,
                  ],
                  [
                    "Auto rotation",
                    previewSet.allowPhotoRotation ? "On" : "Off",
                  ],
                  [
                    "Nameplates",
                    previewSet.photoItems.some(
                      (item) => item.nameplateEnabled,
                    )
                      ? "Included"
                      : "Off",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-3 py-2.5 text-xs"
                  >
                    <dt className="font-technical uppercase text-[var(--gray-500)]">
                      {label}
                    </dt>
                    <dd className="text-right capitalize">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            {previewSet.background.mode === "transparent" ? (
              <p className="rounded-lg border border-[var(--gray-300)] bg-[var(--gray-50)] p-3 text-xs text-[var(--gray-600)]">
                Transparent output requires background removal when the AI
                integration is connected.
              </p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDeleteTarget(previewSet);
                  setPreviewSet(null);
                }}
              >
                <Trash2 className="size-3.5" />
                Delete set
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPreviewSet(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => requestApply(previewSet)}
              >
                <Eye className="size-3.5" />
                Apply Service Set
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        {deleteTarget ? (
          <DialogContent>
            <DialogHeader>
              <p className="micro-label">Remove package</p>
              <DialogTitle>Delete Service Set?</DialogTitle>
              <DialogDescription>
                {deleteTarget.name} will be removed from this workspace. This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  removeServiceSet(deleteTarget.id);
                  setDeleteTarget(null);
                }}
              >
                <Trash2 className="size-3.5" />
                Delete Service Set
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>

      <ServiceSetForm
        open={createFormOpen}
        serviceSet={null}
        onOpenChange={setCreateFormOpen}
        onSubmit={(values) =>
          Boolean(
            createServiceSet({
              name: values.name,
              description: values.description,
              status: values.status,
              isDefault: values.isDefault,
              price: values.price,
              currencyCode: values.currencyCode,
              photoItems: values.photoItems,
              paper: values.paper,
              background: values.background,
              cuttingGuidesEnabled: values.cuttingGuidesEnabled,
              sizeLabelsEnabled: values.sizeLabelsEnabled,
              allowPhotoRotation: values.allowPhotoRotation,
            }),
          )
        }
      />

      <Dialog
        open={Boolean(confirmationSet)}
        onOpenChange={(open) => !open && setConfirmationSet(null)}
      >
        {confirmationSet ? (
          <DialogContent>
            <DialogHeader>
              <p className="micro-label">Replace configuration</p>
              <DialogTitle>Apply Service Set?</DialogTitle>
              <DialogDescription>
                Applying this Service Set will replace the current photo sizes
                and paper settings. Your uploaded photo and crop position will
                not be changed.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-[var(--gray-200)] p-3">
                <p className="micro-label">Current</p>
                <p className="mt-2 text-xs">{photoSizes.length} size types</p>
                <p className="mt-1 text-xs text-[var(--gray-500)]">
                  {paper.name}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--ink)] p-3">
                <p className="micro-label">New</p>
                <p className="mt-2 text-xs">
                  {confirmationSet.photoItems.length} size types
                </p>
                <p className="mt-1 text-xs text-[var(--gray-500)]">
                  {paperName(confirmationSet)}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmationSet(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  applyServiceSet(confirmationSet.id);
                  setConfirmationSet(null);
                }}
              >
                <PackagePlus className="size-3.5" />
                Apply Service Set
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  );
}
