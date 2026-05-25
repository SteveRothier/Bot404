import { TopBar } from "@/components/layout/TopBar";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import type {
  NetworkStats,
  Profile,
  TrendingEvent,
  TrendingHashtag,
} from "@/lib/supabase/types";

type Props = {
  children: React.ReactNode;
  stats: NetworkStats;
  tags: TrendingHashtag[];
  onlineNpcs: Profile[];
  trendingHashtags: TrendingHashtag[];
  event?: TrendingEvent | null;
};

export function AppShell({
  children,
  stats,
  tags,
  onlineNpcs,
  trendingHashtags,
  event,
}: Props) {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <LeftSidebar stats={stats} tags={tags} />
        <main className="min-w-0 flex-1">{children}</main>
        <RightSidebar
          onlineNpcs={onlineNpcs}
          hashtags={trendingHashtags}
          event={event}
        />
      </div>
    </div>
  );
}
