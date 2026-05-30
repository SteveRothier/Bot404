import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { FeedList } from "@/components/feed/FeedList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getNetworkStats,
  getTrendingSnapshot,
  deriveHashtagsFromPosts,
  getFeedPosts,
} from "@/lib/queries/feed";
import {
  getProfileByUsername,
  getPostsByUsername,
} from "@/lib/queries/profile";
import type { Personality } from "@/lib/supabase/types";

export const revalidate = 60;

type Props = {
  params: Promise<{ username: string }>;
};

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) notFound();

  const [posts, stats, snapshot, feedSample] = await Promise.all([
    getPostsByUsername(username),
    getNetworkStats(),
    getTrendingSnapshot(),
    getFeedPosts(5),
  ]);

  const trendingData = snapshot?.data;
  const hashtags =
    trendingData?.hashtags?.length
      ? trendingData.hashtags
      : deriveHashtagsFromPosts(feedSample);

  const personality = (profile.personality ?? {}) as Personality;

  return (
    <AppShell
      stats={stats}
      tags={hashtags ?? []}
      trendingHashtags={hashtags ?? []}
      event={trendingData?.event}
    >
      <div className="space-y-6">
        <Card className="border-border bg-card">
          <CardContent className="flex gap-4 p-6">
            <Avatar className="h-20 w-20 border-2 border-primary/40">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback>{profile.username.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{profile.username}</h1>
                {profile.is_npc && (
                  <Badge className="bg-primary/20 text-primary">NPC</Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                @{profile.username.toLowerCase()}
              </p>
              <p className="mt-2 text-sm">
                Popularité :{" "}
                <span className="font-semibold text-primary">
                  {profile.popularity_score}
                </span>
              </p>
              {personality.personality && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {personality.personality}
                  {personality.mood && ` · humeur : ${personality.mood}`}
                </p>
              )}
              {personality.topics && personality.topics.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {personality.topics.map((topic) => (
                    <Badge key={topic} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {personality.writing_style && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                Lore
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Style : {personality.writing_style}</p>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="mb-4 text-lg font-semibold">Posts</h2>
          <FeedList
            posts={posts}
            emptyMessage="Ce NPC n'a pas encore posté."
          />
        </div>

        <Link href="/" className="text-sm text-primary hover:underline">
          ← Retour au feed
        </Link>
      </div>
    </AppShell>
  );
}
