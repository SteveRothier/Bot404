import { NetworkSummary } from "@/components/widgets/NetworkSummary";
import type { ShellNpcSchedule } from "@/lib/queries/shell-data";
import type { NetworkStats } from "@/lib/supabase/types";

type Props = {
  stats: NetworkStats;
  npcSchedule: ShellNpcSchedule;
};

export function AppSidebarNetworkMobile({ stats, npcSchedule }: Props) {
  return (
    <div className="border-t border-border px-2 pb-4 pt-4 xl:hidden">
      <NetworkSummary stats={stats} npcSchedule={npcSchedule} />
    </div>
  );
}
