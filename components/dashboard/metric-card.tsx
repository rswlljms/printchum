import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};

export function MetricCard({ label, value, detail, icon: Icon }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <p className="micro-label">{label}</p>
          <div className="flex size-9 items-center justify-center rounded-lg border border-[var(--gray-200)] bg-[var(--gray-50)] text-[var(--ink)]">
            <Icon className="size-4" aria-hidden="true" />
          </div>
        </div>
        <p className="font-display text-3xl text-[var(--ink)]">{value}</p>
        <p className="font-technical mt-1 text-[10px] uppercase tracking-wider text-[var(--gray-500)]">{detail}</p>
      </CardContent>
    </Card>
  );
}
