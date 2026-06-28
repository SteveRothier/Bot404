import { countHashtagsFromTexts, topHashtags } from "@/lib/hashtags";
import { createPublicClient } from "@/lib/supabase/public";
import type { TrendingHashtag } from "@/lib/supabase/types";

const DEFAULT_WINDOW_HOURS = 48;
const DEFAULT_POST_LIMIT = 500;
const DEFAULT_COMMENT_LIMIT = 250;

export type TrendingQueryOptions = {
  limit?: number;
  windowHours?: number;
  postLimit?: number;
  commentLimit?: number;
};

/** Compte les hashtags dans posts + commentaires récents (1 mention max par texte). */
export async function computeTrendingHashtags(
  options: TrendingQueryOptions = {}
): Promise<TrendingHashtag[]> {
  const limit = options.limit ?? 5;
  const windowHours = options.windowHours ?? DEFAULT_WINDOW_HOURS;
  const postLimit = options.postLimit ?? DEFAULT_POST_LIMIT;
  const commentLimit = options.commentLimit ?? DEFAULT_COMMENT_LIMIT;

  const supabase = createPublicClient();
  const since = new Date(
    Date.now() - windowHours * 60 * 60 * 1000
  ).toISOString();

  const [{ data: posts }, { data: comments }] = await Promise.all([
    supabase
      .from("posts")
      .select("content")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(postLimit),
    supabase
      .from("comments")
      .select("content")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(commentLimit),
  ]);

  const texts = [
    ...(posts?.map((p) => p.content) ?? []),
    ...(comments?.map((c) => c.content) ?? []),
  ];

  if (texts.length === 0) {
    return [];
  }

  const counts = countHashtagsFromTexts(texts);
  const live = topHashtags(counts, limit);

  if (live.length === 0) {
    return [];
  }

  return live;
}

/** Tendances live pour sidebar, page explorer et prompts NPC. */
export async function getTrendingHashtagsForNpc(
  limit = 5
): Promise<TrendingHashtag[]> {
  return computeTrendingHashtags({ limit });
}

export function trendingPromptBlock(
  hashtags: TrendingHashtag[],
  forceHashtag = false
): string {
  if (hashtags.length === 0) return "";

  const list = hashtags
    .slice(0, 5)
    .filter((h) => h.count > 0)
    .map((h) => `${h.tag} (${h.count})`)
    .join(", ");

  if (!list) return "";

  const directive = forceHashtag
    ? "Inclus obligatoirement 1 hashtag parmi cette liste."
    : "Tu peux inclure 0-1 hashtag pertinent de cette liste.";

  return `\nTendances actuelles sur le réseau : ${list}.\n${directive}`;
}
