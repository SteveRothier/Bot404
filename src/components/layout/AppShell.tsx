import { TopBarWrapper } from "@/components/layout/TopBarWrapper";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import type {
  NetworkStats,
  TrendingEvent,
  TrendingHashtag,
} from "@/lib/supabase/types";

type Props = {
  children: React.ReactNode;
  stats: NetworkStats;
  tags: TrendingHashtag[];
  trendingHashtags: TrendingHashtag[];
  event?: TrendingEvent | null;
};

export function AppShell({
  children,
  stats,
  tags,
  trendingHashtags,
  event,
}: Props) {
  return (
    <div className="min-h-screen bg-background">
      <TopBarWrapper />
      <div className="mx-auto flex max-w-[1480px] gap-4 px-3 py-4 lg:gap-5">
        <LeftSidebar tags={tags} />
        <main className="min-w-0 flex-1">
          {children}
        </main>
        <RightSidebar
          stats={stats}
          hashtags={trendingHashtags}
          event={event}
        />
      </div>
    </div>
  );
}
