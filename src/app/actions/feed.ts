"use server";

import {
  getFeedPosts,
  getHomeFeedTabBundle,
  type HomeFeedTab,
} from "@/lib/queries/feed";
import type { PostWithAuthor } from "@/lib/supabase/types";

export async function loadMoreFeedPosts(
  offset: number,
  limit = 20
): Promise<PostWithAuthor[]> {
  return getFeedPosts(limit, offset);
}

export async function loadHomeFeedTab(tab: HomeFeedTab) {
  return getHomeFeedTabBundle(tab);
}
