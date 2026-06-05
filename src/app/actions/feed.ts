"use server";

import { getCommentById } from "@/lib/queries/comments";
import {
  getFeedPosts,
  getHomeFeedTabBundle,
  getPostById,
  markRecentNarrativePosts,
  type HomeFeedTab,
} from "@/lib/queries/feed";
import type { CommentWithAuthor, PostWithAuthor } from "@/lib/supabase/types";

export async function loadMoreFeedPosts(
  offset: number,
  limit = 20
): Promise<PostWithAuthor[]> {
  return markRecentNarrativePosts(await getFeedPosts(limit, offset));
}

export async function loadHomeFeedTab(tab: HomeFeedTab) {
  return getHomeFeedTabBundle(tab);
}

export async function fetchFeedPostById(
  postId: number
): Promise<PostWithAuthor | null> {
  return getPostById(postId);
}

export async function fetchFeedCommentById(
  commentId: number
): Promise<CommentWithAuthor | null> {
  return getCommentById(commentId);
}
