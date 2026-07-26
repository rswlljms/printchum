"use client";

import { Menu } from "lucide-react";

import { SidebarContent } from "@/components/dashboard/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle className="sr-only">PrintChum navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Navigate between PrintChum application areas.
        </SheetDescription>
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
}
