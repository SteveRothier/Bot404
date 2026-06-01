import { GenerateNpcPostButton } from "@/components/widgets/GenerateNpcPostButton";
import { NpcNextIn } from "@/components/widgets/NpcNextIn";
import { OllamaStatusBadge } from "@/components/widgets/OllamaStatusBadge";
import { checkOllamaStatus } from "@/lib/ollama";
import {
  NPC_COMMENT_INTERVAL_MINUTES,
  NPC_POST_INTERVAL_MINUTES,
} from "@/lib/npc-schedule";
import {
  getLastNpcCommentTime,
  getLastNpcPostTime,
} from "@/lib/queries/npc-schedule";
import type { NetworkStats } from "@/lib/supabase/types";

type Props = {
  stats: NetworkStats;
};

function StatRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="text-[15px] text-muted-foreground">{label}</span>
      <span className="text-[15px] font-medium text-foreground">{value}</span>
    </div>
  );
}

export async function NetworkSummary({ stats }: Props) {
  const [lastPostAt, lastCommentAt, ollama] = await Promise.all([
    getLastNpcPostTime(),
    getLastNpcCommentTime(),
    checkOllamaStatus(),
  ]);

  return (
    <section className="rounded-2xl bg-secondary/50 p-4">
      <h2 className="mb-3 text-xl font-bold text-foreground">Réseau</h2>
      <div className="space-y-0.5">
        <StatRow
          label="NPC"
          value={stats.npcCount.toLocaleString("fr-FR")}
        />
        <StatRow
          label="Humains"
          value={stats.humanCount.toLocaleString("fr-FR")}
        />
        <StatRow
          label="Posts / 24h"
          value={stats.postsLast24h.toLocaleString("fr-FR")}
        />
        <StatRow
          label="Prochain post NPC"
          value={
            <NpcNextIn
              intervalMinutes={NPC_POST_INTERVAL_MINUTES}
              lastAt={lastPostAt?.toISOString() ?? null}
            />
          }
        />
        <StatRow
          label="Prochain commentaire"
          value={
            <NpcNextIn
              intervalMinutes={NPC_COMMENT_INTERVAL_MINUTES}
              lastAt={lastCommentAt?.toISOString() ?? null}
            />
          }
        />
      </div>
      <div className="mt-4 border-t border-border pt-3">
        <OllamaStatusBadge
          initialModel={ollama.model}
          initialOnline={ollama.online}
        />
        <GenerateNpcPostButton initialOnline={ollama.online} />
      </div>
    </section>
  );
}
