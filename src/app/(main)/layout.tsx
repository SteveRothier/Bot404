import { AppShell } from "@/components/layout/AppShell";
import { getCachedSidebarAuth } from "@/lib/queries/cached";
import { getShellData } from "@/lib/queries/shell-data";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [shell, sidebarAuth] = await Promise.all([
    getShellData(),
    getCachedSidebarAuth(),
  ]);

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
