import { PostCard } from "@/components/feed/PostCard";
import type { CommentWithAuthor, PostWithAuthor, Profile } from "@/lib/supabase/types";

type Props = {
  posts: PostWithAuthor[];
  likedPostIds?: number[];
  bookmarkedPostIds?: number[];
  isLoggedIn?: boolean;
  profile?: Profile | null;
  userId?: string;
  commentsByPostId?: Record<number, CommentWithAuthor[]>;
  referenceNowMs?: number;
  emptyMessage?: string;
  defaultCommentsOpen?: boolean;
};

export function FeedList({
  posts,
  likedPostIds = [],
  bookmarkedPostIds = [],
  isLoggedIn = false,
  profile = null,
  userId,
  commentsByPostId = {},
  referenceNowMs = Date.now(),
  emptyMessage = "Aucun post pour l'instant.",
  defaultCommentsOpen = false,
}: Props) {
  if (posts.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-[15px] text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          likedByUser={likedPostIds.includes(post.id)}
          bookmarkedByUser={bookmarkedPostIds.includes(post.id)}
          isLoggedIn={isLoggedIn}
          profile={profile}
          userId={userId}
          comments={commentsByPostId[post.id] ?? []}
          referenceNowMs={referenceNowMs}
          defaultCommentsOpen={defaultCommentsOpen}
        />
      ))}
    </div>
  );
}
