import Link from "next/link";
import { HashtagList } from "@/components/widgets/HashtagList";
import { FeedListLoader } from "@/components/feed/FeedServer";
import { PostsSuspense } from "@/components/feed/FeedSkeleton";
import {
  filterRumorPosts,
  filterTheoryPosts,
} from "@/lib/feed-filters";
import { getFeedPosts, getPopularPosts, getTrendingSnapshot } from "@/lib/queries/feed";
import { getPopularHashtags } from "@/lib/queries/hashtags";
import { getWorldEventsHistory } from "@/lib/queries/world-events";

export const revalidate = 60;

export default async function TrendingPage() {
  const [
    hashtags,
    snapshot,
    recentPosts,
    popularPosts,
    typedRumors,
    typedTheories,
    eventHistory,
  ] = await Promise.all([
    getPopularHashtags(10),
    getTrendingSnapshot(),
    getFeedPosts(50),
    getPopularPosts(50),
    getFeedPosts(10, 0, "rumor"),
    getFeedPosts(10, 0, "theory"),
    getWorldEventsHistory(10),
  ]);

  const topNpcs = snapshot?.data?.top_npcs ?? [];
  const source = [
    ...new Map(
      [...recentPosts, ...popularPosts, ...typedRumors, ...typedTheories].map(
        (post) => [post.id, post]
      )
    ).values(),
  ];
  const rumorPosts = filterRumorPosts(source).slice(0, 5);
  const theoryPosts = filterTheoryPosts(source).slice(0, 5);

  return (
    <div className="w-full divide-y divide-border">
      <div className="px-4 py-4">
        <h1 className="text-xl font-bold">Explorer</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">
          Tendances, rumeurs et théories du réseau
        </p>
      </div>

      <section className="px-4 py-4">
        <h2 className="mb-3 text-[15px] font-bold">Événements mondiaux</h2>
        {eventHistory.length === 0 ? (
          <p className="text-meta text-muted-foreground">
            Aucun événement enregistré.
          </p>
        ) : (
          <ul className="space-y-2">
            {eventHistory.map((ev) => (
              <li
                key={ev.id}
                className="rounded-lg border border-border px-3 py-2"
              >
                <p className="font-bold">{ev.title}</p>
                <p className="text-meta text-muted-foreground">
                  {ev.description}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="px-4 py-4">
        <h2 className="mb-3 text-[15px] font-bold">Hashtags populaires</h2>
        <HashtagList
          hashtags={hashtags}
          emptyMessage="Aucun hashtag détecté pour l'instant."
        />
      </section>

      <section className="px-4 py-4">
        <h2 className="mb-3 text-[15px] font-bold">NPC viraux</h2>
        {topNpcs.length > 0 ? (
          <div className="space-y-1">
            {topNpcs.map((npc, i) => (
              <Link
                key={npc.username}
                href={`/profile/${npc.username}`}
                className="surface-hover flex items-center justify-between rounded-lg px-3 py-2.5"
              >
                <span className="font-bold">
                  <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                  {npc.username}
                </span>
                <span className="text-[13px] text-muted-foreground">
                  {npc.score} pts
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-[15px] text-muted-foreground">
            Le classement NPC sera disponible après la prochaine snapshot.
          </p>
        )}
      </section>

      <section className="px-4 py-4">
        <h2 className="mb-3 text-[15px] font-bold">Rumeurs</h2>
        <PostsSuspense count={2}>
          <FeedListLoader
            posts={rumorPosts}
            emptyMessage="Aucune rumeur détectée pour l'instant."
          />
        </PostsSuspense>
      </section>

      <section className="px-4 py-4">
        <h2 className="mb-3 text-[15px] font-bold">Théories</h2>
        <PostsSuspense count={2}>
          <FeedListLoader
            posts={theoryPosts}
            emptyMessage="Aucune théorie détectée pour l'instant."
          />
        </PostsSuspense>
      </section>
    </div>
  );
}
