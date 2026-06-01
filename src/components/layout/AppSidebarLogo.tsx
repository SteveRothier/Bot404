"use client";

import Link from "next/link";
import { Bot } from "lucide-react";
import { useNavDrawerClose } from "@/components/layout/NavDrawerContext";

export function AppSidebarLogo() {
  const closeDrawer = useNavDrawerClose();

  return (
    <Link
      href="/"
      className="shrink-0 px-3 py-2"
      onClick={() => closeDrawer?.()}
    >
      <div className="flex items-center gap-2">
        <Bot className="h-7 w-7 text-accent" strokeWidth={1.75} />
        <div className="leading-tight">
          <span className="text-xl font-bold text-foreground">Bot404</span>
          <span className="text-meta block text-muted-foreground">
            human not found
          </span>
        </div>
      </div>
    </Link>
  );
}
