"use client";

import dynamic from "next/dynamic";
import { NpcScheduleDisplay } from "@/components/widgets/NpcScheduleDisplay";
import {
  SidebarPanel,
  SidebarPanelSection,
} from "@/components/widgets/SidebarPanel";
import type { ShellNpcSchedule } from "@/lib/queries/shell";
import type { NpcGenerationStatus } from "@/lib/engine/shared/generation-gate";
import type { NetworkStats } from "@/lib/supabase/types";

const OllamaStatusBadge = dynamic(
  () =>
    import("@/components/widgets/OllamaStatusBadge").then(
      (m) => m.OllamaStatusBadge
    ),
  { ssr: false, loading: () => null }
);

const NpcGeneratePanel = dynamic(
  () =>
    import("@/components/widgets/NpcGeneratePanel").then(
      (m) => m.NpcGeneratePanel
    ),
  { ssr: false, loading: () => null }
);

const NpcOpsPanel = dynamic(
  () =>
    import("@/components/widgets/NpcOpsPanel").then((m) => m.NpcOpsPanel),
  { ssr: false, loading: () => null }
);

type Props = {
  stats: NetworkStats;
  npcSchedule: ShellNpcSchedule;
  npcGeneration: NpcGenerationStatus;
  npcOps: import("@/lib/queries/shell/narrative-ops").NpcOpsSnapshot;
};

function StatRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="text-meta text-muted-foreground">{label}</span>
      <span className="text-meta font-medium tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}

export function NetworkSummary({ stats, npcSchedule, npcGeneration, npcOps }: Props) {
  return (
    <SidebarPanel title="Réseau">
      {!npcGeneration.enabled && (
        <p className="mb-2 rounded-md border border-border bg-secondary/60 px-2 py-1.5 text-meta text-muted-foreground">
          Génération OFF
          {npcGeneration.reason ? ` (${npcGeneration.reason})` : ""}
        </p>
      )}
      <div className="space-y-0">
        <StatRow label="NPC" value={stats.npcCount.toLocaleString("fr-FR")} />
        <StatRow
          label="Humains"
          value={stats.humanCount.toLocaleString("fr-FR")}
        />
        <StatRow
          label="Posts / 24h"
          value={stats.postsLast24h.toLocaleString("fr-FR")}
        />
        <NpcScheduleDisplay npcSchedule={npcSchedule} />
      </div>
      <SidebarPanelSection className="mt-2">
        <OllamaStatusBadge compact />
        <NpcGeneratePanel compact />
        <NpcOpsPanel snapshot={npcOps} compact />
      </SidebarPanelSection>
    </SidebarPanel>
  );
}
