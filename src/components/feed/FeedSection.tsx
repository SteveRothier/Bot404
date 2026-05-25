"use client";

import { useState } from "react";
import { PostComposer } from "@/components/feed/PostComposer";
import { FeedTabs, type FeedTab } from "@/components/feed/FeedTabs";
import { FeedList } from "@/components/feed/FeedList";
import type { PostWithAuthor } from "@/lib/supabase/types";

type Props = {
  recentPosts: PostWithAuthor[];
  popularPosts: PostWithAuthor[];
};

export function FeedSection({ recentPosts, popularPosts }: Props) {
  const [tab, setTab] = useState<FeedTab>("for-you");

  const posts =
    tab === "popular"
      ? popularPosts
      : tab === "recent"
        ? recentPosts
        : recentPosts;

  return (
    <div className="space-y-4">
      <PostComposer />
      <FeedTabs value={tab} onChange={setTab} />
      <FeedList posts={posts} />
    </div>
  );
}
