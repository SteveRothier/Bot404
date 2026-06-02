import { LoreAlertsPanel } from "@/components/lore/LoreAlertsPanel";
import { FactionControlLive } from "@/components/widgets/FactionControlLive";
import { NetworkSummary } from "@/components/widgets/NetworkSummary";
import { TrendingList } from "@/components/widgets/TrendingList";
import type { ShellLoreAlerts, ShellNpcSchedule } from "@/lib/queries/shell-data";
import type { NetworkStats, TrendingHashtag } from "@/lib/supabase/types";

type Props = {
  hashtags: TrendingHashtag[];
  stats: NetworkStats;
  npcSchedule: ShellNpcSchedule;
  loreAlerts: ShellLoreAlerts;
};

export function RightSidebar({
  hashtags,
  stats,
  npcSchedule,
  loreAlerts,
}: Props) {
  return (
    <aside className="sidebar-sticky hidden w-80 shrink-0 flex-col gap-4 xl:flex">
      <LoreAlertsPanel {...loreAlerts} />
      <TrendingList hashtags={hashtags} compact />
      <FactionControlLive />
      <NetworkSummary stats={stats} npcSchedule={npcSchedule} />
    </aside>
  );
}
