import { NetworkSummary } from "@/components/widgets/NetworkSummary";
import { TrendingList } from "@/components/widgets/TrendingList";
import type { NetworkStats, TrendingHashtag } from "@/lib/supabase/types";

type Props = {
  hashtags: TrendingHashtag[];
  stats: NetworkStats;
};

export function RightSidebar({ hashtags, stats }: Props) {
  return (
    <aside className="sidebar-sticky hidden w-80 shrink-0 flex-col gap-4 xl:flex">
      <TrendingList hashtags={hashtags} />
      <NetworkSummary stats={stats} />
    </aside>
  );
}
