"use client";

import { ChevronDown, Cloud, HelpCircle, LogOut, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockAccount } from "@/features/account/mock-account";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/editor": "Create Layout",
};

export function AppHeader() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "PrintChum";

  return (
    <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <div>
          <p className="text-xs font-medium text-slate-500">PrintChum workspace</p>
          <h1 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Badge variant="success" className="hidden gap-1.5 sm:inline-flex">
          <Cloud className="size-3" aria-hidden="true" />
          Browser session ready
        </Badge>
        <div className="hidden rounded-lg border border-slate-200 px-3 py-1.5 text-right sm:block">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">AI credits</p>
          <p className="text-sm font-semibold text-slate-900">{mockAccount.aiCreditsRemaining}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100"
              aria-label="Open account menu"
            >
              <Avatar>
                <AvatarFallback>SO</AvatarFallback>
              </Avatar>
              <ChevronDown className="hidden size-3.5 text-slate-500 sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <span className="block font-medium text-slate-900">{mockAccount.name}</span>
              <span className="block">{mockAccount.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 h-px bg-slate-200" />
            <DropdownMenuItem>
              <UserRound className="mr-2 size-4" /> Account placeholder
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 size-4" /> Help
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut className="mr-2 size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
