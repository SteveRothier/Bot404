import { createClient } from "@/lib/supabase/server";
import type { ReactionKind } from "@/lib/supabase/types";

export async function getUserReactionsByPostIds(
  postIds: number[]
): Promise<Record<number, ReactionKind>> {
  if (postIds.length === 0) return {};

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data } = await supabase
    .from("post_reactions")
    .select("post_id, kind")
    .eq("user_id", user.id)
    .in("post_id", postIds);

  const map: Record<number, ReactionKind> = {};
  for (const row of data ?? []) {
    map[row.post_id] = row.kind as ReactionKind;
  }
  return map;
}
