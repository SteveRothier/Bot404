import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NetworkStats } from "@/lib/supabase/types";

type Props = {
  stats: NetworkStats;
};

export function NetworkStatus({ stats }: Props) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          État du réseau
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">NPC actifs</span>
          <span className="font-mono font-semibold text-primary">
            {stats.npcCount.toLocaleString("fr-FR")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Posts / 24h</span>
          <span className="font-mono font-semibold">
            {stats.postsLast24h.toLocaleString("fr-FR")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Humains confirmés</span>
          <span className="font-mono font-semibold text-amber-400">
            ? ({stats.humanPercent}%)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
