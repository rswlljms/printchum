"use client";

import {
  ArrowDown,
  ArrowUp,
  Copy,
  PackagePlus,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ServiceSetForm } from "@/components/service-sets/service-set-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatServiceSetPrice } from "@/features/editor/service-set-presentation";
import { findPaperPreset } from "@/lib/paper/presets";
import type { ServiceSet } from "@/lib/service-sets/types";
import { useEditorStore } from "@/stores/editor-store";

type Filter = "all" | "enabled" | "disabled" | "default" | "built-in" | "custom";

function paperName(serviceSet: ServiceSet): string {
  return serviceSet.paper.source === "custom"
    ? serviceSet.paper.name
    : findPaperPreset(serviceSet.paper.presetId)?.name ?? "Unknown paper";
}

export function ServiceSetsManager() {
  const serviceSets = useEditorStore((state) => state.serviceSets);
  const createServiceSet = useEditorStore((state) => state.createServiceSet);
  const updateServiceSet = useEditorStore((state) => state.updateServiceSet);
  const duplicateServiceSet = useEditorStore(
    (state) => state.duplicateServiceSet,
  );
  const removeServiceSet = useEditorStore((state) => state.removeServiceSet);
  const setServiceSetStatus = useEditorStore(
    (state) => state.setServiceSetStatus,
  );
  const setDefaultServiceSet = useEditorStore(
    (state) => state.setDefaultServiceSet,
  );
  const moveServiceSet = useEditorStore((state) => state.moveServiceSet);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState<ServiceSet | null | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<ServiceSet | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setReady(true);
      if (
        new URLSearchParams(window.location.search).get("create") === "1"
      ) {
        setEditing(null);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const filteredSets = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return [...serviceSets]
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .filter((serviceSet) => {
        const matchesFilter =
          filter === "all" ||
          (filter === "enabled" && serviceSet.status === "enabled") ||
          (filter === "disabled" && serviceSet.status === "disabled") ||
          (filter === "default" && serviceSet.isDefault) ||
          (filter === "built-in" && serviceSet.isBuiltIn) ||
          (filter === "custom" && !serviceSet.isBuiltIn);
        const haystack = [
          serviceSet.name,
          serviceSet.description ?? "",
          paperName(serviceSet),
          ...serviceSet.photoItems.map((item) => item.name),
        ]
          .join(" ")
          .toLocaleLowerCase();
        return matchesFilter && (!query || haystack.includes(query));
      });
  }, [filter, search, serviceSets]);

  return (
    <div
      className="page-enter mx-auto w-full max-w-[1600px] space-y-8 p-4 sm:p-6"
    >
      <header className="flex flex-col justify-between gap-5 border-b border-[var(--gray-200)] py-8 md:flex-row md:items-end">
        <div>
          <p className="micro-label">01 — presets</p>
          <h2 className="font-display mt-2 text-4xl text-[var(--ink)]">
            Service Sets
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-[var(--gray-500)]">
            Create reusable packages for common photo sizes, quantities, paper
            settings, and studio pricing. Frontend mock state only.
          </p>
        </div>
        <Button type="button" onClick={() => setEditing(null)}>
          <PackagePlus className="size-4" />
          Create Service Set
        </Button>
      </header>

      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <label className="text-xs font-medium">
          Search Service Sets
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, size, or paper"
            className="mt-1.5 h-10 w-full rounded-md border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 text-sm"
          />
        </label>
        <label className="text-xs font-medium">
          Status and type
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as Filter)}
            className="mt-1.5 h-10 w-full rounded-md border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 text-sm"
          >
            <option value="all">All</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
            <option value="default">Default</option>
            <option value="built-in">Built-in</option>
            <option value="custom">Custom</option>
          </select>
        </label>
      </div>

      {feedback ? (
        <p
          className="rounded-lg bg-[var(--ink)] px-4 py-3 text-sm text-[var(--inverted-ink)]"
          role="status"
        >
          {feedback}
        </p>
      ) : null}

      {!ready ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-[var(--gray-500)]">
            Loading Service Sets…
          </CardContent>
        </Card>
      ) : filteredSets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg font-semibold text-[var(--ink)]">
              {serviceSets.length === 0
                ? "No custom Service Sets yet"
                : "No matching Service Sets"}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--gray-500)]">
              Create reusable packages for common photo sizes, quantities,
              paper settings, and studio pricing.
            </p>
            <Button className="mt-4" onClick={() => setEditing(null)}>
              Create Service Set
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredSets.map((serviceSet, index) => {
            const totalCopies = serviceSet.photoItems.reduce(
              (total, item) => total + item.quantity,
              0,
            );
            return (
              <Card key={serviceSet.id} data-service-set-id={serviceSet.id}>
                <CardContent className="grid gap-4 p-4 lg:grid-cols-[minmax(180px,1.2fr)_1fr_110px_110px_auto] lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-[var(--ink)]">
                        {serviceSet.name}
                      </h3>
                      <Badge
                        variant={
                          serviceSet.status === "enabled"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {serviceSet.status}
                      </Badge>
                      {serviceSet.isDefault ? <Badge>Default</Badge> : null}
                      <Badge variant="secondary">
                        {serviceSet.isBuiltIn ? "Built-in" : "Custom"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-[var(--gray-500)]">
                      {serviceSet.description}
                    </p>
                  </div>
                  <div className="font-technical text-[10px] uppercase leading-5 text-[var(--gray-500)]">
                    <p>
                      {serviceSet.photoItems.length} sizes · {totalCopies} copies
                    </p>
                    <p>{paperName(serviceSet)}</p>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatServiceSetPrice(serviceSet)}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={index === 0}
                      onClick={() => moveServiceSet(serviceSet.id, "up")}
                      aria-label={`Move ${serviceSet.name} up`}
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={index === filteredSets.length - 1}
                      onClick={() => moveServiceSet(serviceSet.id, "down")}
                      aria-label={`Move ${serviceSet.name} down`}
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap justify-start gap-1 lg:justify-end">
                    {!serviceSet.isBuiltIn ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditing(serviceSet)}
                      >
                        <Pencil className="size-3" />
                        Edit
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const id = duplicateServiceSet(serviceSet.id);
                        if (id) {
                          setFeedback(`${serviceSet.name} duplicated.`);
                        }
                      }}
                    >
                      <Copy className="size-3" />
                      Duplicate
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const nextStatus =
                          serviceSet.status === "enabled"
                            ? "disabled"
                            : "enabled";
                        setServiceSetStatus(serviceSet.id, nextStatus);
                        setFeedback(
                          `${serviceSet.name} ${nextStatus}.`,
                        );
                      }}
                    >
                      {serviceSet.status === "enabled"
                        ? "Disable"
                        : "Enable"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={
                        serviceSet.status === "disabled" ||
                        serviceSet.isDefault
                      }
                      onClick={() => {
                        if (setDefaultServiceSet(serviceSet.id)) {
                          setFeedback(
                            `${serviceSet.name} is now the default.`,
                          );
                        }
                      }}
                    >
                      <Star className="size-3" />
                      Default
                    </Button>
                    {!serviceSet.isBuiltIn ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget(serviceSet)}
                      >
                        <Trash2 className="size-3" />
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {editing !== undefined ? (
        <ServiceSetForm
          open
          serviceSet={editing}
          onOpenChange={(open) => {
            if (!open) {
              setEditing(undefined);
            }
          }}
          onSubmit={(values) => {
            if (editing) {
              const updated = updateServiceSet(editing.id, values);
              if (updated) {
                setFeedback(`${values.name} updated.`);
              }
              return updated;
            }
            const id = createServiceSet({
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
            });
            if (id) {
              setFeedback(`${values.name} created.`);
            }
            return Boolean(id);
          }}
        />
      ) : null}

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        {deleteTarget ? (
          <DialogContent>
            <DialogHeader>
              <p className="micro-label">Remove reusable configuration</p>
              <DialogTitle>Delete Service Set?</DialogTitle>
              <DialogDescription>
                This removes the reusable configuration only. It will not
                remove the current photo or active editor layout.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (removeServiceSet(deleteTarget.id)) {
                    setFeedback(`${deleteTarget.name} deleted.`);
                  }
                  setDeleteTarget(null);
                }}
              >
                Delete custom set
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
