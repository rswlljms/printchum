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
    <div className="mx-auto max-w-[1480px] space-y-6 p-4 sm:p-6">
      <section className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
        <div>
          <Badge className="mb-3">{mockAccount.plan} workspace</Badge>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Welcome back, Studio Owner
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Workspace metrics">
        {dashboardMetrics.map((metric, index) => (
          <MetricCard key={metric.label} {...metric} icon={metricIcons[index]} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-950">Recent templates</h3>
                <p className="mt-1 text-sm text-slate-500">Layout settings only—never customer photos.</p>
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
            <h3 className="font-semibold text-slate-950">Recently used presets</h3>
            <p className="mt-1 text-sm text-slate-500">Mock preparation guides for Phase 1.</p>
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
