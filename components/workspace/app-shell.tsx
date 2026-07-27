import { AppHeader } from "@/components/workspace/app-header";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-[var(--background)]">
        <AppHeader />
        <main
          className="workspace-background-accent min-h-[calc(100vh-4.5rem)]"
          data-workspace-accent="halftone"
        >
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
}
