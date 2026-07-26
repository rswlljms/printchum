import { AppHeader } from "@/components/dashboard/app-header";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar />
        <div className="min-h-screen lg:pl-64">
          <AppHeader />
          <main>{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
