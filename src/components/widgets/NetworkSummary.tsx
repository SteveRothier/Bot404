import { NpcGeneratePanel } from "@/components/widgets/NpcGeneratePanel";
import { NpcNextIn } from "@/components/widgets/NpcNextIn";
import { OllamaStatusBadge } from "@/components/widgets/OllamaStatusBadge";
import { checkOllamaStatus } from "@/lib/ollama";
import {
  NPC_COMMENT_INTERVAL_MINUTES,
  NPC_POST_INTERVAL_MINUTES,
  minutesUntilNextNpcRun,
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
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="text-meta text-muted-foreground">{label}</span>
      <span className="text-meta font-medium tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}

export async function NetworkSummary({ stats }: Props) {
  const [lastPostAt, lastCommentAt, ollama] = await Promise.all([
    getLastNpcPostTime(),
    getLastNpcCommentTime(),
    checkOllamaStatus(),
  ]);

  const nextPostMinutes = minutesUntilNextNpcRun(
    lastPostAt,
    NPC_POST_INTERVAL_MINUTES
  );
  const nextCommentMinutes = minutesUntilNextNpcRun(
    lastCommentAt,
    NPC_COMMENT_INTERVAL_MINUTES
  );

  return (
    <section className="rounded-2xl bg-secondary/50 p-3">
      <h2 className="mb-2 text-[15px] font-bold text-foreground">Réseau</h2>
      <div className="space-y-0">
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
          label="Post NPC"
          value={
            <NpcNextIn
              intervalMinutes={NPC_POST_INTERVAL_MINUTES}
              lastAt={lastPostAt?.toISOString() ?? null}
              initialMinutes={nextPostMinutes}
            />
          }
        />
        <StatRow
          label="Com. NPC"
          value={
            <NpcNextIn
              intervalMinutes={NPC_COMMENT_INTERVAL_MINUTES}
              lastAt={lastCommentAt?.toISOString() ?? null}
              initialMinutes={nextCommentMinutes}
            />
          }
        />
      </div>
      <div className="mt-2 border-t border-border pt-2">
        <OllamaStatusBadge
          initialModel={ollama.model}
          initialOnline={ollama.online}
          compact
        />
        <NpcGeneratePanel initialOnline={ollama.online} compact />
      </div>
    </section>
  );
}
