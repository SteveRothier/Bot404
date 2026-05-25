import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/lib/supabase/types";

type Props = {
  npcs: Profile[];
};

export function NpcOnlineList({ npcs }: Props) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          NPC en ligne
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {npcs.map((npc, i) => (
          <Link
            key={npc.id}
            href={`/profile/${npc.username}`}
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary"
          >
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={npc.avatar_url ?? undefined} alt={npc.username} />
                <AvatarFallback>{npc.username.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{npc.username}</p>
              <p className="truncate text-xs text-muted-foreground">
                @{npc.username.toLowerCase()}
              </p>
            </div>
            <Badge
              variant="outline"
              className="shrink-0 border-emerald-500/40 bg-emerald-500/10 text-[10px] text-emerald-400"
            >
              {i === 0 ? "EN DIRECT" : "EN LIGNE"}
            </Badge>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
