import { AppShell } from "@/components/layout/AppShell";
import { FeedSection } from "@/components/feed/FeedSection";
import {
  deriveHashtagsFromPosts,
  getFeedPosts,
  getNetworkStats,
  getOnlineNpcs,
  getPopularPosts,
  getTrendingSnapshot,
} from "@/lib/queries/feed";

export const revalidate = 60;

export default async function HomePage() {
  const [recentPosts, popularPosts, stats, onlineNpcs, snapshot] =
    await Promise.all([
      getFeedPosts(),
      getPopularPosts(),
      getNetworkStats(),
      getOnlineNpcs(5),
      getTrendingSnapshot(),
    ]);

  const trendingData = snapshot?.data;
  const hashtags =
    trendingData?.hashtags?.length
      ? trendingData.hashtags
      : deriveHashtagsFromPosts(recentPosts);

  return (
    <AppShell
      stats={stats}
      tags={hashtags ?? []}
      onlineNpcs={onlineNpcs}
      trendingHashtags={hashtags ?? []}
      event={trendingData?.event}
    >
      <FeedSection recentPosts={recentPosts} popularPosts={popularPosts} />
    </AppShell>
  );
}
