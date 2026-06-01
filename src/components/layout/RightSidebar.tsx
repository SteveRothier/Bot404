import { FactionControlLive } from "@/components/widgets/FactionControlLive";
import { NetworkSummary } from "@/components/widgets/NetworkSummary";
import { TrendingList } from "@/components/widgets/TrendingList";
import { RightSidebarGate } from "@/components/layout/RightSidebarGate";
import type { ShellNpcSchedule } from "@/lib/queries/shell-data";
import type { NetworkStats, TrendingHashtag } from "@/lib/supabase/types";

type Props = {
  hashtags: TrendingHashtag[];
  stats: NetworkStats;
  npcSchedule: ShellNpcSchedule;
};

export function RightSidebar({ hashtags, stats, npcSchedule }: Props) {
  return (
    <RightSidebarGate>
      <aside className="sidebar-sticky flex w-80 shrink-0 flex-col gap-4">
        <TrendingList hashtags={hashtags} compact />
        <FactionControlLive />
        <NetworkSummary stats={stats} npcSchedule={npcSchedule} />
      </aside>
    </RightSidebarGate>
  );
}
