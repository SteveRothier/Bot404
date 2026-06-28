import { createClient } from "@/lib/supabase/server";

export async function getUserLikedCommentIds(
  commentIds: number[],
  userId?: string
): Promise<Set<number>> {
  if (commentIds.length === 0) return new Set();

  const supabase = await createClient();
  const id =
    userId ??
    (
      await supabase.auth.getUser()
    ).data.user?.id;
  if (!id) return new Set();

  const { data } = await supabase
    .from("comment_likes")
    .select("comment_id")
    .eq("user_id", id)
    .in("comment_id", commentIds);

  return new Set((data ?? []).map((row) => row.comment_id));
}

export async function getUserBookmarkedCommentIds(
  commentIds: number[],
  userId?: string
): Promise<Set<number>> {
  if (commentIds.length === 0) return new Set();

  const supabase = await createClient();
  const id =
    userId ??
    (
      await supabase.auth.getUser()
    ).data.user?.id;
  if (!id) return new Set();

  const { data } = await supabase
    .from("comment_bookmarks")
    .select("comment_id")
    .eq("user_id", id)
    .in("comment_id", commentIds);

  return new Set((data ?? []).map((row) => row.comment_id));
}
