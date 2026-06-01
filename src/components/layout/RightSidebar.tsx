import { FactionControlLive } from "@/components/widgets/FactionControlLive";
import { NetworkSummary } from "@/components/widgets/NetworkSummary";
import { TrendingList } from "@/components/widgets/TrendingList";
import type { Faction, NetworkStats, TrendingHashtag } from "@/lib/supabase/types";

type Props = {
  hashtags: TrendingHashtag[];
  stats: NetworkStats;
  factions: Faction[];
};

export function RightSidebar({ hashtags, stats, factions }: Props) {
  return (
    <aside className="sidebar-sticky hidden w-80 shrink-0 flex-col gap-4 xl:flex">
      <TrendingList hashtags={hashtags} compact />
      <FactionControlLive initialFactions={factions} />
      <NetworkSummary stats={stats} />
    </aside>
  );
}
