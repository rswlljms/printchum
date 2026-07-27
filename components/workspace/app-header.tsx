"use client";

import { ChevronDown, HelpCircle, LogOut, UserRound } from "lucide-react";

import { ThemeToggle } from "@/components/workspace/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockAccount } from "@/features/account/mock-account";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-[var(--gray-200)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <div>
          <p className="micro-label">PrintChum workspace</p>
          <h1 className="font-display text-lg text-[var(--ink)]">Create Layout</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden rounded-lg border border-[var(--gray-200)] px-3 py-1.5 text-right sm:block">
          <p className="micro-label">AI credits</p>
          <p className="font-display text-sm text-[var(--ink)]">{mockAccount.aiCreditsRemaining}</p>
        </div>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-[var(--gray-100)]"
              aria-label="Open account menu"
            >
              <Avatar>
                <AvatarFallback>SO</AvatarFallback>
              </Avatar>
              <ChevronDown className="hidden size-3.5 text-[var(--gray-500)] sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <span className="block font-medium text-[var(--ink)]">{mockAccount.name}</span>
              <span className="block">{mockAccount.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 h-px bg-[var(--gray-200)]" />
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
