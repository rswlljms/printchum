import { FileStack, Images, Ruler, Sparkles, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

import { MetricCard } from "@/components/dashboard/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { mockAccount } from "@/features/account/mock-account";
import {
  dashboardMetrics,
  recentPassportPresets,
  recentTemplates,
} from "@/features/dashboard/mock-dashboard-data";

const metricIcons = [Images, Sparkles, FileStack, Ruler] as const;

export function DashboardOverview() {
  return (
    <div
      className="page-enter mx-auto w-full max-w-[1600px] space-y-8 p-4 sm:p-6 xl:space-y-10"
      data-dashboard-layout="wide"
    >
      <section className="halftone-field flex flex-col justify-between gap-6 border-b border-[var(--gray-200)] py-8 sm:flex-row sm:items-end">
        <div>
          <Badge className="mb-3">{mockAccount.plan} workspace</Badge>
          <h2 className="font-display text-4xl leading-none text-[var(--ink)]">
            Welcome back, Studio Owner
          </h2>
          <p className="mt-4 max-w-2xl text-sm text-[var(--gray-600)]">
            Prepare accurate, print-ready photo sheets while keeping customer photos in the browser.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/editor">
              <Sparkles className="size-4" />
              Create new layout
            </Link>
          </Button>
          <Button variant="outline" disabled title="Service Sets arrive in a later phase">
            <SlidersHorizontal className="size-4" />
            Manage service sets
          </Button>
        </div>
      </section>

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Workspace metrics"
      >
        {dashboardMetrics.map((metric, index) => (
          <MetricCard key={metric.label} {...metric} icon={metricIcons[index]} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <p className="micro-label">01 — templates</p>
                <h3 className="mt-1 font-semibold text-[var(--ink)]">Recent templates</h3>
                <p className="mt-1 text-sm text-[var(--gray-500)]">Layout settings only—never customer photos.</p>
              </div>
              <Badge variant="secondary">{recentTemplates.length} recent</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100">
              {recentTemplates.map((template) => (
                <div key={template.id} className="flex items-center gap-3 py-3">
                  <div className="flex size-10 items-center justify-center rounded-[10px] bg-slate-100">
                    <FileStack className="size-4 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{template.name}</p>
                    <p className="text-xs text-slate-500">{template.detail}</p>
                  </div>
                  <Button variant="ghost" size="sm" disabled>
                    Open
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="micro-label">02 — presets</p>
            <h3 className="mt-1 font-semibold text-[var(--ink)]">Recently used presets</h3>
            <p className="mt-1 text-sm text-[var(--gray-500)]">Mock preparation guides for Phase 1.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPassportPresets.map((preset) => (
                <div key={preset.country} className="rounded-[10px] border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-800">{preset.country}</p>
                    <Badge variant="secondary">{preset.size}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{preset.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
