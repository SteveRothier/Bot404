import { createClient } from "@/lib/supabase/server";
import { getCachedFactions } from "@/lib/queries/cached";
import type { DashboardStats, NetworkStats } from "@/lib/supabase/types";

export async function getDashboardStats(
  network?: NetworkStats
): Promise<DashboardStats> {
  const supabase = await createClient();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    npcCount,
    humanCount,
    postsCount,
    signalsCount,
    rumorsCount,
    factions,
  ] = await Promise.all([
    network
      ? Promise.resolve(network.npcCount)
      : supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("is_npc", true)
          .then(({ count }) => count ?? 0),
    network
      ? Promise.resolve(network.humanCount)
      : supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("is_npc", false)
          .then(({ count }) => count ?? 0),
    network
      ? Promise.resolve(network.postsLast24h)
      : supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .gte("created_at", since24h)
          .then(({ count }) => count ?? 0),
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("post_type", "signal")
      .gte("created_at", since24h)
      .then(({ count }) => count ?? 0),
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("post_type", "rumor")
      .gte("created_at", since24h)
      .then(({ count }) => count ?? 0),
    getCachedFactions(),
  ]);

  const topFaction = factions[0] ?? null;

  return {
    npcCount,
    humanCount,
    postsLast24h: postsCount,
    signalsLast24h: signalsCount,
    rumorsLast24h: rumorsCount,
    topFaction,
  };
}
