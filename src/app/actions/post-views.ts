"use server";

import { createClient } from "@/lib/supabase/server";

export async function recordPostView(
  postId: number
): Promise<{ viewCount: number } | { error: string }> {
  if (!Number.isFinite(postId) || postId < 1) {
    return { error: "Post invalide." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("increment_post_view", {
    p_post_id: postId,
  });

  if (error) return { error: error.message };

  const viewCount = typeof data === "number" ? data : Number(data);
  if (!Number.isFinite(viewCount) || viewCount < 1) {
    return { error: "Impossible d'enregistrer la vue." };
  }

  return { viewCount };
}
