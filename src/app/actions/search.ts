"use server";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export async function searchProfilesForMention(
  query: string
): Promise<Pick<Profile, "id" | "username" | "avatar_url" | "is_npc">[]> {
  const q = query.trim();
  if (!q || q.length < 1) return [];

  const supabase = await createClient();
  const pattern = `%${q.replace(/%/g, "\\%")}%`;

  const { data } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, is_npc")
    .ilike("username", pattern)
    .order("popularity_score", { ascending: false })
    .limit(6);

  return data ?? [];
}
