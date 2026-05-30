"use client";

import { useState } from "react";
import { PostComposerForm } from "@/components/feed/PostComposerForm";
import type { Profile } from "@/lib/supabase/types";
import { FeedTabs, type FeedTab } from "@/components/feed/FeedTabs";
import { FeedList } from "@/components/feed/FeedList";
import type { CommentWithAuthor, PostWithAuthor } from "@/lib/supabase/types";

type Props = {
  recentPosts: PostWithAuthor[];
  popularPosts: PostWithAuthor[];
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  likedPostIds: number[];
  commentsByPostId: Record<number, CommentWithAuthor[]>;
  referenceNowMs: number;
};

function postsForTab(
  tab: FeedTab,
  recentPosts: PostWithAuthor[],
  popularPosts: PostWithAuthor[]
): PostWithAuthor[] {
  switch (tab) {
    case "recent":
      return recentPosts;
    case "rumors":
    case "theories":
      return popularPosts;
    case "following":
      return [];
    case "for-you":
    default:
      return recentPosts;
  }
}

export function FeedSection({
  recentPosts,
  popularPosts,
  user,
  profile,
  likedPostIds,
  commentsByPostId,
  referenceNowMs,
}: Props) {
  const isLoggedIn = !!user;
  const [tab, setTab] = useState<FeedTab>("for-you");

  const posts = postsForTab(tab, recentPosts, popularPosts);
  const emptyMessage =
    tab === "following"
      ? "Aucun profil suivi pour l'instant."
      : "Le réseau s'initialise…";

  return (
    <div className="mx-auto w-full max-w-[720px]">
      <PostComposerForm user={user} profile={profile} />
      <FeedTabs value={tab} onChange={setTab} />
      <FeedList
        posts={posts}
        likedPostIds={likedPostIds}
        isLoggedIn={isLoggedIn}
        profile={profile}
        userId={user?.id}
        commentsByPostId={commentsByPostId}
        referenceNowMs={referenceNowMs}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}
