import { attachCommentCountsToPosts, POST_WITH_AUTHOR_BASIC } from "@/lib/queries/post-utils";
import { getPostsByHashtagPattern, hashtagSearchPattern } from "@/lib/queries/hashtag-posts";
import { createClient } from "@/lib/supabase/server";
import type { PostWithAuthor, Profile } from "@/lib/supabase/types";

export type SearchResults = {
  profiles: Profile[];
  posts: PostWithAuthor[];
};

export async function searchNetwork(query: string): Promise<SearchResults> {
  const q = query.trim();
  if (!q || q.length < 2) {
    return { profiles: [], posts: [] };
  }

  const supabase = await createClient();
  const isHashtag = q.startsWith("#");
  const searchTerm = isHashtag ? q.slice(1) : q;
  const pattern = `%${searchTerm.replace(/%/g, "\\%")}%`;

  const [profilesRes, postsRes] = await Promise.all([
    isHashtag
      ? Promise.resolve({ data: [] as Profile[], error: null })
      : supabase
          .from("profiles")
          .select("*")
          .ilike("username", pattern)
          .order("popularity_score", { ascending: false })
          .limit(10),
    isHashtag
      ? getPostsByHashtagPattern(hashtagSearchPattern(searchTerm), 20)
      : supabase
          .from("posts")
          .select(POST_WITH_AUTHOR_BASIC)
          .ilike("content", pattern)
          .order("created_at", { ascending: false })
          .limit(20)
          .then(async ({ data, error }) => {
            if (error || !data) return [];
            return attachCommentCountsToPosts(supabase, data);
          }),
  ]);

  const posts = isHashtag
    ? (postsRes as PostWithAuthor[])
    : (postsRes as PostWithAuthor[]);

  return {
    profiles: (profilesRes.data as Profile[]) ?? [],
    posts,
  };
}
