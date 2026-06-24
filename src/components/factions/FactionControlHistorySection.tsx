import { FactionControlChart } from "@/components/factions/FactionControlChart";
import { FactionControlTimeline } from "@/components/factions/FactionControlTimeline";
import { snapshotsToSeries } from "@/lib/factions/control-history";
import {
  getFactionControlHistoryForTimeline,
  getFactionControlSnapshots,
} from "@/lib/queries/faction-history";
import type { Faction } from "@/lib/supabase/types";

type Props = {
  factions: Faction[];
};

export async function FactionControlHistorySection({ factions }: Props) {
  const [snapshots24h, snapshots7d, timelineSnapshots] = await Promise.all([
    getFactionControlSnapshots("24h"),
    getFactionControlSnapshots("7d"),
    getFactionControlHistoryForTimeline(50),
  ]);

  const series24h = snapshotsToSeries(snapshots24h, factions);
  const series7d = snapshotsToSeries(snapshots7d, factions);

  return (
    <section className="px-4 py-4">
      <h2 className="mb-3 text-[15px] font-bold">Évolution du contrôle</h2>
      <FactionControlChart series24h={series24h} series7d={series7d} />
      <h3 className="mb-2 mt-5 text-meta font-semibold uppercase tracking-wide text-muted-foreground">
        Derniers changements
      </h3>
      <FactionControlTimeline
        snapshots={timelineSnapshots}
        factions={factions}
      />
    </section>
  );
}
