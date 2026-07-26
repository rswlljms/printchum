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
};

const navigation: readonly NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, enabled: true },
  { label: "Create Layout", href: "/editor", icon: Sparkles, enabled: true },
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
        <div className="font-display flex size-9 items-center justify-center rounded-xl bg-[var(--ink)] text-sm text-[var(--inverted-ink)]">
          P
        </div>
        <div>
          <p className="font-display text-base text-[var(--ink)]">PrintChum</p>
          <p className="font-technical text-[9px] uppercase tracking-wider text-[var(--gray-500)]">
            Upload once. Print every size.
          </p>
        </div>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 p-3" aria-label="Main navigation">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);
          const itemClass = cn(
            "font-technical flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-[11px] font-medium uppercase tracking-[0.07em]",
            isActive &&
              "bg-[var(--ink)] text-[var(--inverted-ink)]",
            !isActive && item.enabled && "text-[var(--gray-500)] hover:bg-[var(--gray-50)] hover:text-[var(--ink)]",
            !item.enabled && "cursor-not-allowed text-[var(--gray-400)]",
          );

          if (!item.enabled) {
            return (
              <div key={item.href} className={itemClass} aria-disabled="true">
                <Icon className="size-3.5" aria-hidden="true" />
                <span>{item.label}</span>
                <span className="ml-auto text-[10px] font-normal uppercase tracking-wide">
                  Soon
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={itemClass}
              aria-current={isActive ? "page" : undefined}
              data-active={isActive}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {isActive ? <span aria-hidden="true">→</span> : null}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <Separator className="mb-3" />
        <div className="rounded-xl border border-[var(--gray-200)] bg-[var(--gray-50)] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--gray-800)]">{mockAccount.name}</span>
            <Badge>{mockAccount.plan}</Badge>
          </div>
          <p className="font-technical truncate text-[10px] text-[var(--gray-500)]">{mockAccount.email}</p>
          <button
            type="button"
            className="font-technical mt-3 flex w-full items-center gap-2 rounded-lg py-1.5 text-[10px] uppercase tracking-wider text-[var(--gray-500)] hover:text-[var(--ink)]"
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
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 border-r border-[var(--gray-200)] bg-[var(--surface)] lg:block">
      <SidebarContent />
    </aside>
  );
}
