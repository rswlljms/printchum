"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";

type ThemePreference = "light" | "dark" | "system";

const themeOptions = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
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

  const selectTheme = (
    nextPreference: ThemePreference,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    if (nextPreference === preference) {
      return;
    }

    const updateTheme = () => {
      window.localStorage.setItem("printchum-theme", nextPreference);
      setPreference(nextPreference);
      applyTheme(nextPreference);
    };
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!document.startViewTransition || prefersReducedMotion) {
      updateTheme();
      return;
    }

    const buttonBounds = event.currentTarget.getBoundingClientRect();
    const originX = buttonBounds.left + buttonBounds.width / 2;
    const originY = buttonBounds.top + buttonBounds.height / 2;
    const endRadius = Math.hypot(
      Math.max(originX, window.innerWidth - originX),
      Math.max(originY, window.innerHeight - originY),
    );

    document.documentElement.setAttribute("data-theme-transition", "active");
    const transition = document.startViewTransition(updateTheme);

    void transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0 at ${originX}px ${originY}px)`,
            `circle(${endRadius}px at ${originX}px ${originY}px)`,
          ],
        },
        {
          duration: 540,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });

    void transition.finished.finally(() => {
      document.documentElement.removeAttribute("data-theme-transition");
    });
  };

  return (
    <div
      className="flex items-center rounded-full border border-[var(--gray-300)] bg-[var(--gray-50)] p-0.5"
      role="group"
      aria-label="Theme preference"
    >
      {themeOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = preference === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={(event) => selectTheme(option.value, event)}
            className="flex size-6 items-center justify-center rounded-full text-[var(--gray-500)] transition-colors duration-200 hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--background)] data-[selected=true]:bg-[var(--gray-200)] data-[selected=true]:text-[var(--ink)]"
            data-selected={isSelected}
            aria-label={`Use ${option.label.toLowerCase()} theme`}
            aria-pressed={isSelected}
            title={option.label}
          >
            <Icon className="size-3.5" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
