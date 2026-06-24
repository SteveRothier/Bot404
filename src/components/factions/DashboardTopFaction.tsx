"use client";

import { FactionControlPercent } from "@/components/widgets/FactionControlPercent";
import type { Faction } from "@/lib/supabase/types";

type Props = {
  faction: Faction;
};

export function DashboardTopFaction({ faction }: Props) {
  return (
    <section className="px-4 py-4">
      <h2 className="mb-2 text-[15px] font-bold">Faction dominante</h2>
      <p style={{ color: faction.color }} className="font-bold">
        {faction.name} —{" "}
        <FactionControlPercent
          factionId={faction.id}
          fallback={Number(faction.control_percent)}
          className="tabular-nums"
        />
      </p>
    </section>
  );
}
