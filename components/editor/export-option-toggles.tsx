"use client";

export type ExportToggleOptions = {
  includeCuttingGuides: boolean;
  includeSizeLabels: boolean;
  includeNameplates: boolean;
  includeBackground: boolean;
};

type ExportOptionTogglesProps = {
  value: ExportToggleOptions;
  onChange: (value: ExportToggleOptions) => void;
};

export function ExportOptionToggles({
  value,
  onChange,
}: ExportOptionTogglesProps) {
  const rows = [
    ["includeCuttingGuides", "Cutting guides"],
    ["includeSizeLabels", "Size labels"],
    ["includeNameplates", "Nameplates"],
    ["includeBackground", "Selected background"],
  ] as const;
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-xs font-medium text-[var(--gray-700)]">
        Printed details
      </legend>
      {rows.map(([key, label]) => (
        <label
          key={key}
          className="flex min-h-9 items-center justify-between gap-3 rounded-lg border border-[var(--gray-200)] px-3 text-xs"
        >
          {label}
          <input
            type="checkbox"
            checked={value[key]}
            onChange={(event) =>
              onChange({ ...value, [key]: event.target.checked })
            }
            className="size-4 accent-[var(--ink)]"
          />
        </label>
      ))}
    </fieldset>
  );
}
