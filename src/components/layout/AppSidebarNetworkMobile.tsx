import { NetworkSummary } from "@/components/widgets/NetworkSummary";
import type { NetworkStats } from "@/lib/supabase/types";

type Props = {
  stats: NetworkStats;
};

export async function AppSidebarNetworkMobile({ stats }: Props) {
  return (
    <div className="border-t border-border px-2 pb-4 pt-4 xl:hidden">
      <NetworkSummary stats={stats} />
    </div>
  );
}
