"use client";

import { FileText, Images } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const modes = [
  { href: "/", label: "Pictures", icon: Images },
  { href: "/documents", label: "Documents", icon: FileText },
] as const;

export function WorkspaceModeSwitcher() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Workspace mode"
      className="flex w-fit items-center gap-1 rounded-lg border border-[var(--gray-200)] p-1"
    >
      {modes.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? "page" : undefined}
          className="font-technical flex min-h-8 items-center gap-2 rounded-md px-3 text-[10px] font-medium uppercase tracking-wider text-[var(--gray-600)] transition-colors duration-150 ease-out hover:bg-[var(--gray-100)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] aria-[current=page]:bg-[var(--ink)] aria-[current=page]:text-[var(--inverted-ink)]"
        >
          <Icon className="size-3.5" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
