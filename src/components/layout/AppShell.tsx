import { TopBarWrapper } from "@/components/layout/TopBarWrapper";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { MobileNavWrapper } from "@/components/layout/MobileNavWrapper";
import type { NetworkStats, TrendingHashtag } from "@/lib/supabase/types";

type Props = {
  children: React.ReactNode;
  stats: NetworkStats;
  hashtags: TrendingHashtag[];
};

export function AppShell({ children, stats, hashtags }: Props) {
  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      <TopBarWrapper />
      <div className="mx-auto flex max-w-[1280px] items-start gap-6 px-3 lg:gap-8 lg:px-4">
        <LeftSidebar stats={stats} />
        <main className="min-w-0 flex-1 border-l border-border py-0 lg:max-w-[600px]">
          {children}
        </main>
        <RightSidebar hashtags={hashtags} />
      </div>
      <MobileNavWrapper />
    </div>
  );
}
