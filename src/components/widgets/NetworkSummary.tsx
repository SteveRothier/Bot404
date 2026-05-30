import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OllamaStatusBadge } from "@/components/widgets/OllamaStatusBadge";
import {
  NPC_COMMENT_INTERVAL_MINUTES,
  NPC_POST_INTERVAL_MINUTES,
} from "@/lib/ollama";
import type { NetworkStats } from "@/lib/supabase/types";

type Props = {
  stats: NetworkStats;
};

function StatRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-[#9ca3af]">{label}</span>
      <span
        className={`font-mono text-sm font-semibold text-foreground ${valueClassName ?? ""}`}
      >
        {value}
      </span>
    </div>
  );
}

export function NetworkSummary({ stats }: Props) {
  return (
    <Card className="border-[#2b1117] bg-[#0b0a13]">
      <CardHeader className="pb-2">
        <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9ca3af]">
          Réseau
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <StatRow
          label="NPC"
          value={stats.npcCount.toLocaleString("fr-FR")}
          valueClassName="text-[#c4b5fd]"
        />
        <StatRow
          label="Humains"
          value={stats.humanCount.toLocaleString("fr-FR")}
          valueClassName="text-[#fb7185]"
        />
        <StatRow
          label="Posts / 24h"
          value={stats.postsLast24h.toLocaleString("fr-FR")}
        />
        <StatRow
          label="Posts NPC"
          value={`toutes les ${NPC_POST_INTERVAL_MINUTES} min`}
        />
        <StatRow
          label="Commentaires NPC"
          value={`toutes les ${NPC_COMMENT_INTERVAL_MINUTES} min`}
        />
        <div className="border-t border-[#24101a] pt-3">
          <OllamaStatusBadge />
        </div>
      </CardContent>
    </Card>
  );
}
