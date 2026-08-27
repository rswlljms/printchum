import { AppHeader } from "@/components/workspace/app-header";
import { WorkspaceFooter } from "@/components/workspace/workspace-footer";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex min-h-screen flex-col bg-[var(--background)]">
        <AppHeader />
        <main
          className="workspace-background-accent min-h-[calc(100vh-4.5rem)] flex-1"
          data-workspace-accent="halftone"
        >
          {children}
        </main>
        <WorkspaceFooter />
      </div>
    </TooltipProvider>
  );
}
