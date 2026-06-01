import { countHashtagsFromTexts, normalizeHashtag, topHashtags } from "@/lib/hashtags";
import { attachCommentCountsToPosts } from "@/lib/queries/post-utils";
import { createClient } from "@/lib/supabase/server";
import type { PostWithAuthor, TrendingHashtag } from "@/lib/supabase/types";

const CONTENT_LIMIT = 500;

export async function getPopularHashtags(
  limit = 5
): Promise<TrendingHashtag[]> {
  const supabase = await createClient();

  const [postsRes, commentsRes] = await Promise.all([
    supabase
      .from("posts")
      .select("content")
      .order("created_at", { ascending: false })
      .limit(CONTENT_LIMIT),
    supabase
      .from("comments")
      .select("content")
      .order("created_at", { ascending: false })
      .limit(CONTENT_LIMIT),
  ]);

  const texts = [
    ...(postsRes.data?.map((row) => row.content) ?? []),
    ...(commentsRes.data?.map((row) => row.content) ?? []),
  ];

  const counts = countHashtagsFromTexts(texts);
  return topHashtags(counts, limit);
}

export async function getPostsByHashtag(
  tagSlug: string,
  limit = 30
): Promise<PostWithAuthor[]> {
  const normalized = normalizeHashtag(tagSlug);
  const searchTerm = normalized.replace(/^#/, "");
  const pattern = `%#${searchTerm.replace(/%/g, "\\%")}%`;

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
