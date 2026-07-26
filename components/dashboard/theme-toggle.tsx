"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ThemePreference = "light" | "dark" | "system";

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

function applyTheme(preference: ThemePreference): void {
  const isDark =
    preference === "dark" ||
    (preference === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.dataset.theme = preference;
}

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    const stored = window.localStorage.getItem("printchum-theme");
    const initialPreference: ThemePreference =
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system";
    const synchronizationTimer = window.setTimeout(() => {
      setPreference(initialPreference);
      applyTheme(initialPreference);
    }, 0);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => {
      if (
        (window.localStorage.getItem("printchum-theme") ?? "system") ===
        "system"
      ) {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", updateSystemTheme);
    return () => {
      window.clearTimeout(synchronizationTimer);
      mediaQuery.removeEventListener("change", updateSystemTheme);
    };
  }, []);

  const selectTheme = (nextPreference: ThemePreference) => {
    window.localStorage.setItem("printchum-theme", nextPreference);
    setPreference(nextPreference);
    applyTheme(nextPreference);
  };

  const ActiveIcon =
    themeOptions.find((option) => option.value === preference)?.icon ?? Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Theme: ${preference}`}
          title={`Theme: ${preference}`}
        >
          <ActiveIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => selectTheme(option.value)}
              className="font-technical text-xs uppercase tracking-wider"
            >
              <Icon className="mr-2 size-4" />
              {option.label}
              {preference === option.value ? (
                <Check className="ml-auto size-3.5" />
              ) : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
