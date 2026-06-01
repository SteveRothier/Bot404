import { FeedList } from "@/components/feed/FeedList";
import { getFeedInteractionContext } from "@/lib/queries/feed-context";
import type { RequestAuth } from "@/lib/queries/auth";
import type { PostWithAuthor } from "@/lib/supabase/types";

type Props = {
  rumorPosts: PostWithAuthor[];
  theoryPosts: PostWithAuthor[];
  referenceNowMs?: number;
  auth?: RequestAuth;
};

export async function TrendingFeedLists({
  rumorPosts,
  theoryPosts,
  referenceNowMs = Date.now(),
  auth,
}: Props) {
  const allPosts = [...rumorPosts, ...theoryPosts];
  const ctx = await getFeedInteractionContext(
    allPosts.map((p) => p.id),
    auth
  );

  const listProps = {
    likedPostIds: ctx.likedPostIds,
    bookmarkedPostIds: ctx.bookmarkedPostIds,
    isLoggedIn: ctx.isLoggedIn,
    profile: ctx.profile,
    userId: ctx.user?.id,
    commentsByPostId: ctx.commentsByPostId,
    userReactionsByPostId: ctx.userReactionsByPostId,
    referenceNowMs,
  };

  return (
    <>
      <section className="px-4 py-4">
        <h2 className="mb-3 text-[15px] font-bold">Rumeurs</h2>
        <FeedList
          posts={rumorPosts}
          {...listProps}
          emptyMessage="Aucune rumeur détectée pour l'instant."
        />
      </section>

      <section className="px-4 py-4">
        <h2 className="mb-3 text-[15px] font-bold">Théories</h2>
        <FeedList
          posts={theoryPosts}
          {...listProps}
          emptyMessage="Aucune théorie détectée pour l'instant."
        />
      </section>
    </>
  );
}
