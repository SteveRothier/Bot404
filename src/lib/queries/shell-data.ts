import { getPopularHashtags } from "@/lib/queries/hashtags";
import { getNetworkStats, getTrendingSnapshot } from "@/lib/queries/feed";
import { getFactions } from "@/lib/queries/factions";

export async function getShellData() {
  const [stats, snapshot, hashtags, factions] = await Promise.all([
    getNetworkStats(),
    getTrendingSnapshot(),
    getPopularHashtags(5),
    getFactions(),
  ]);

  return {
    stats,
    hashtags,
    factions,
    event: snapshot?.data?.event ?? null,
  };
}
