import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AppShellFallback } from "@/components/layout/AppShellFallback";
import { getCachedSidebarAuth } from "@/lib/queries/cached";
import { getShellData } from "@/lib/queries/shell-data";

type Props = {
  children: React.ReactNode;
};

async function AppShellWithData({
  children,
  sidebarAuth,
}: {
  children: React.ReactNode;
  sidebarAuth: Awaited<ReturnType<typeof getCachedSidebarAuth>>;
}) {
  const shell = await getShellData();

  return (
    <AppShell
      stats={shell.stats}
      hashtags={shell.hashtags}
      factions={shell.factions}
      npcSchedule={shell.npcSchedule}
      ollama={shell.ollama}
      sidebarAuth={sidebarAuth}
    >
      {children}
    </AppShell>
  );
}

export async function MainLayoutShell({ children }: Props) {
  const sidebarAuth = await getCachedSidebarAuth();

  return (
    <Suspense
      fallback={
        <AppShellFallback sidebarAuth={sidebarAuth}>{children}</AppShellFallback>
      }
    >
      <AppShellWithData sidebarAuth={sidebarAuth}>{children}</AppShellWithData>
    </Suspense>
  );
}
