import { normalizeHashtag } from "@/lib/hashtags";
import { attachCommentCountsToPosts } from "@/lib/queries/post-utils";
import { createClient } from "@/lib/supabase/server";
import type { PostWithAuthor } from "@/lib/supabase/types";

export function hashtagSearchPattern(tagSlug: string): string {
  const normalized = normalizeHashtag(tagSlug);
  const searchTerm = normalized.replace(/^#/, "");
  return `%#${searchTerm.replace(/%/g, "\\%")}%`;
}

export async function getPostsByHashtagPattern(
  pattern: string,
  limit = 30
): Promise<PostWithAuthor[]> {
  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*, author:profiles!author_id(*)")
    .ilike("content", pattern)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !posts) return [];
  return attachCommentCountsToPosts(supabase, posts);
}
