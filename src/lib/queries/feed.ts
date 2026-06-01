import { attachCommentCountsToPosts, POST_WITH_AUTHOR } from "@/lib/queries/post-utils";
import { getCommentsByPostIds } from "@/lib/queries/comments";
import { getUserBookmarkedPostIds } from "@/lib/queries/bookmarks";
import {
  getPostsFromFollowing,
  getSuggestedNpcs,
} from "@/lib/queries/follows";
import { getUserReactionsByPostIds } from "@/lib/queries/reactions";
import { countActiveWorldEvents } from "@/lib/queries/world-events";
import { computeNetworkState } from "@/lib/network-state";
import { getRequestAuth, type RequestAuth } from "@/lib/queries/auth";
import { createClient } from "@/lib/supabase/server";

import type {
  NetworkStats,
  PostType,
  PostWithAuthor,
  Profile,
  ReactionKind,
  TrendingSnapshot,
} from "@/lib/supabase/types";

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const { profile } = await getRequestAuth();
  return profile;
}

export async function getUserLikedPostIds(userId?: string): Promise<Set<number>> {
  const supabase = await createClient();
  const id =
    userId ??
    (
      await supabase.auth.getUser()
    ).data.user?.id;
  if (!id) return new Set();

  const { data } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("user_id", id);

  return new Set(data?.map((r) => r.post_id) ?? []);
}

export async function getFeedPosts(
  limit = 50,
  offset = 0,
  postType?: PostType
): Promise<PostWithAuthor[]> {
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select(POST_WITH_AUTHOR)
    .order("created_at", { ascending: false });

  if (postType) {
    query = query.eq("post_type", postType);
  }

  const { data: posts, error } = await query.range(offset, offset + limit - 1);

  if (error || !posts) return [];

  return attachCommentCountsToPosts(supabase, posts);
}

export async function getPostById(id: number): Promise<PostWithAuthor | null> {
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select(POST_WITH_AUTHOR)
    .eq("id", id)
    .maybeSingle();

  if (error || !post) return null;

  const [enriched] = await attachCommentCountsToPosts(supabase, [post]);
  return enriched ?? null;
}

export async function getPopularPosts(limit = 50): Promise<PostWithAuthor[]> {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select(POST_WITH_AUTHOR)
    .order("likes_count", { ascending: false })
    .limit(limit);

  if (error || !posts) return [];

  return attachCommentCountsToPosts(supabase, posts);
}

export async function getHomeFeedBundle(auth?: RequestAuth) {
  const { user } = auth ?? (await getRequestAuth());
  const userId = user?.id;

  const [
    recentPosts,
    theoryPosts,
    rumorPosts,
    likedPostIds,
    bookmarkedPostIds,
    followingPosts,
    suggestedNpcs,
  ] = await Promise.all([
    getFeedPosts(50),
    getFeedPosts(50, 0, "theory"),
    getFeedPosts(50, 0, "rumor"),
    userId ? getUserLikedPostIds(userId) : Promise.resolve(new Set<number>()),
    userId ? getUserBookmarkedPostIds(userId) : Promise.resolve(new Set<number>()),
    user ? getPostsFromFollowing(50) : Promise.resolve([]),
    getSuggestedNpcs(3),
  ]);

  const allPosts = [...recentPosts, ...theoryPosts, ...rumorPosts, ...followingPosts];
  const postIds = [...new Set(allPosts.map((p) => p.id))];
  const [commentsByPostId, userReactionsByPostId] = await Promise.all([
    getCommentsByPostIds(postIds),
    userId
      ? getUserReactionsByPostIds(postIds, userId)
      : Promise.resolve({} as Record<number, ReactionKind>),
  ]);

  return {
    recentPosts,
    theoryPosts,
    rumorPosts,
    followingPosts,
    suggestedNpcs,
    likedPostIds: [...likedPostIds],
    bookmarkedPostIds: [...bookmarkedPostIds],
    commentsByPostId,
    userReactionsByPostId,
  };
}

export async function getTrendingSnapshot(): Promise<TrendingSnapshot | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trending_snapshots")
    .select("*")
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as TrendingSnapshot;
}

export async function getNetworkStats(): Promise<NetworkStats> {
  const supabase = await createClient();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: npcCount },
    { count: humanCount },
    { count: postsCount },
    { data: flaggedPosts },
    activeEventsCount,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_npc", true),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_npc", false),
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since24h),
    supabase.from("posts").select("flag_count").gte("created_at", since24h),
    countActiveWorldEvents(),
  ]);

  const total = (npcCount ?? 0) + (humanCount ?? 0);
  const humanPct = total > 0 ? (humanCount ?? 0) / total : 0.0003;
  const humanPercent = (humanPct * 100).toFixed(2);
  const totalFlags24h =
    flaggedPosts?.reduce((sum, p) => sum + (p.flag_count ?? 0), 0) ?? 0;

  const networkState = computeNetworkState({
    humanPercent: humanPct,
    flags24h: totalFlags24h,
    activeEvents: activeEventsCount,
  });

  return {
    npcCount: npcCount ?? 0,
    humanCount: humanCount ?? 0,
    postsLast24h: postsCount ?? 0,
    humanPercent,
    networkState,
    totalFlags24h,
    activeEventsCount,
  };
}
