import { AlertTriangle } from "lucide-react";

type ExportWarningListProps = {
  warnings: readonly string[];
};

export function ExportWarningList({
  warnings,
}: ExportWarningListProps) {
  if (warnings.length === 0) {
    return null;
  }
  return (
    <div
      className="space-y-2 rounded-xl border border-[var(--gray-300)] bg-[var(--gray-50)] p-3"
      aria-label="Export warnings"
    >
      {warnings.map((warning) => (
        <p
          key={warning}
          className="flex gap-2 text-xs leading-5 text-[var(--gray-700)]"
        >
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          <span>{warning}</span>
        </p>
      ))}
    </div>
  );
}
