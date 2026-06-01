import { createClient } from "@/lib/supabase/server";
import { getFactions } from "@/lib/queries/factions";
import type { DashboardStats } from "@/lib/supabase/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: npcCount },
    { count: humanCount },
    { count: postsCount },
    { count: signalsCount },
    { count: rumorsCount },
    factions,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_npc", true),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_npc", false),
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since24h),
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("post_type", "signal")
      .gte("created_at", since24h),
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("post_type", "rumor")
      .gte("created_at", since24h),
    getFactions(),
  ]);

  const topFaction = factions[0] ?? null;

  return {
    npcCount: npcCount ?? 0,
    humanCount: humanCount ?? 0,
    postsLast24h: postsCount ?? 0,
    signalsLast24h: signalsCount ?? 0,
    rumorsLast24h: rumorsCount ?? 0,
    topFaction,
  };
}
