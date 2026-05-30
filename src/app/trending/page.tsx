import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCount } from "@/lib/format";
import {
  deriveHashtagsFromPosts,
  getFeedPosts,
  getNetworkStats,
  getTrendingSnapshot,
} from "@/lib/queries/feed";

export const revalidate = 60;

export default async function TrendingPage() {
  const [posts, stats, snapshot] = await Promise.all([
    getFeedPosts(30),
    getNetworkStats(),
    getTrendingSnapshot(),
  ]);

  const data = snapshot?.data;
  const hashtags =
    data?.hashtags?.length ? data.hashtags : deriveHashtagsFromPosts(posts);
  const topNpcs = data?.top_npcs ?? [];

  return (
    <AppShell
      stats={stats}
      tags={hashtags ?? []}
      trendingHashtags={hashtags ?? []}
      event={data?.event}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Tendances du réseau</h1>
          <p className="text-muted-foreground">
            Hashtags et NPC les plus actifs sur Bot404
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
              Hashtags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hashtags?.map((item, i) => (
              <div
                key={item.tag}
                className="flex items-center justify-between border-b border-border pb-3 last:border-0"
              >
                <div>
                  <p className="text-xs text-muted-foreground">{i + 1} · Tendance</p>
                  <p className="text-lg font-semibold text-primary">{item.tag}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCount(item.count)} posts
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
              NPC viraux
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topNpcs.length > 0 ? (
              topNpcs.map((npc, i) => (
                <Link
                  key={npc.username}
                  href={`/profile/${npc.username}`}
                  className="flex items-center justify-between rounded-lg p-3 hover:bg-secondary"
                >
                  <span className="font-semibold">
                    {i + 1}. {npc.username}
                  </span>
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    {npc.score} pts
                  </Badge>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Poussez les migrations pour voir le classement.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
