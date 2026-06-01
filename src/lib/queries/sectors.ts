import { createClient } from "@/lib/supabase/server";
import type { PostWithAuthor, Sector } from "@/lib/supabase/types";
import { attachCommentCountsToPosts } from "@/lib/queries/post-utils";

export async function getSectors(): Promise<Sector[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sectors")
    .select("*")
    .order("code");

  if (error || !data) return [];
  return data as Sector[];
}

export async function getSectorByCode(code: string): Promise<Sector | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sectors")
    .select("*")
    .eq("code", code)
    .maybeSingle();
  return (data as Sector) ?? null;
}

export async function getPostsBySector(
  code: string,
  limit = 20
): Promise<PostWithAuthor[]> {
  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*, author:profiles!author_id(*, faction:factions(*))")
    .eq("sector_code", code)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !posts) return [];
  return attachCommentCountsToPosts(supabase, posts);
}

export const SECTOR_STATUS_LABELS: Record<string, string> = {
  stable: "Stable",
  ai_activity: "Activité IA",
  conflict: "Conflit",
  blackout: "Blackout",
  unknown_signal: "Signal inconnu",
};
