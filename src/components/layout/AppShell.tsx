import { AppSidebarMobile } from "@/components/layout/AppSidebarMobile";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import type { Faction, NetworkStats, TrendingHashtag } from "@/lib/supabase/types";

type Props = {
  children: React.ReactNode;
  stats: NetworkStats;
  hashtags: TrendingHashtag[];
  factions: Faction[];
};

export function AppShell({ children, stats, hashtags, factions }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1280px] items-start gap-6 px-3 lg:gap-8 lg:px-4">
        <LeftSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <AppSidebarMobile stats={stats} />
          <main className="min-w-0 flex-1 border-l border-border py-0 lg:max-w-[600px]">
            {children}
          </main>
        </div>

        <RightSidebar hashtags={hashtags} stats={stats} factions={factions} />
      </div>
    </div>
  );
}
