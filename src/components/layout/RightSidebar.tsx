import { TrendingList } from "@/components/widgets/TrendingList";
import { NetworkSummary } from "@/components/widgets/NetworkSummary";
import type { NpcOpsSnapshot } from "@/lib/queries/shell/narrative-ops";
import type { ShellNpcSchedule } from "@/lib/queries/shell";
import type { NpcGenerationStatus } from "@/lib/engine/shared/generation-gate";
import type { NetworkStats, TrendingHashtag } from "@/lib/supabase/types";

type Props = {
  hashtags: TrendingHashtag[];
  stats: NetworkStats;
  npcSchedule: ShellNpcSchedule;
  npcGeneration: NpcGenerationStatus;
  npcOps: NpcOpsSnapshot;
};

export function RightSidebar({
  hashtags,
  stats,
  npcSchedule,
  npcGeneration,
  npcOps,
}: Props) {
  return (
    <aside className="sidebar-sticky hidden w-80 shrink-0 flex-col gap-4 xl:flex">
      <TrendingList hashtags={hashtags} compact />
      <NetworkSummary
        stats={stats}
        npcSchedule={npcSchedule}
        npcGeneration={npcGeneration}
        npcOps={npcOps}
      />
    </aside>
  );
}
