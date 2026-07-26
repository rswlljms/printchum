"use client";

import {
  CreditCard,
  FileImage,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Settings,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mockAccount } from "@/features/account/mock-account";
import { cn } from "@/lib/class-names";

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  enabled: boolean;
  primary?: boolean;
};

const navigation: readonly NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, enabled: true },
  { label: "Create Layout", href: "/editor", icon: Sparkles, enabled: true, primary: true },
  { label: "Projects", href: "/projects", icon: FolderOpen, enabled: false },
  { label: "Service Sets", href: "/service-sets", icon: SlidersHorizontal, enabled: false },
  { label: "Passport Presets", href: "/passport-presets", icon: FileImage, enabled: false },
  { label: "Billing", href: "/billing", icon: CreditCard, enabled: false },
  { label: "Settings", href: "/settings", icon: Settings, enabled: false },
];

export function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-18 items-center gap-3 px-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
          P
        </div>
        <div>
          <p className="font-semibold tracking-tight text-slate-950">PrintChum</p>
          <p className="text-[11px] text-slate-500">Upload once. Print every size.</p>
        </div>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 p-3" aria-label="Main navigation">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const itemClass = cn(
            "flex min-h-10 w-full items-center gap-3 rounded-[10px] px-3 text-sm font-medium",
            isActive && "bg-blue-50 text-blue-700",
            !isActive && item.enabled && "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
            !item.enabled && "cursor-not-allowed text-slate-400",
            item.primary && !isActive && "bg-blue-600 text-white hover:bg-blue-700 hover:text-white",
          );

          if (!item.enabled) {
            return (
              <div key={item.href} className={itemClass} aria-disabled="true">
                <Icon className="size-4" aria-hidden="true" />
                <span>{item.label}</span>
                <span className="ml-auto text-[10px] font-normal uppercase tracking-wide">
                  Soon
                </span>
              </div>
            );
          }

          return (
            <Link key={item.href} href={item.href} className={itemClass}>
              <Icon className="size-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <Separator className="mb-3" />
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">{mockAccount.name}</span>
            <Badge>{mockAccount.plan}</Badge>
          </div>
          <p className="truncate text-xs text-slate-500">{mockAccount.email}</p>
          <button
            type="button"
            className="mt-3 flex w-full items-center gap-2 rounded-lg py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
            title="Authentication will be connected in a later phase"
          >
            <LogOut className="size-3.5" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">
      <SidebarContent />
    </aside>
  );
}
