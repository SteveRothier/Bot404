import {
  getPostsByHashtagPattern,
  hashtagSearchPattern,
} from "@/lib/queries/explore/hashtag-posts";
import { computeTrendingHashtags } from "@/lib/engine/shared/trending";
import { createClient } from "@/lib/supabase/server";
import type { TrendingHashtag } from "@/lib/supabase/types";

export async function getPopularHashtags(
  limit = 5
): Promise<TrendingHashtag[]> {
  return computeTrendingHashtags({ limit });
}

export async function getPostsByHashtag(tagSlug: string, limit = 30) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return getPostsByHashtagPattern(
    hashtagSearchPattern(tagSlug),
    limit,
    user?.id
  );
}
