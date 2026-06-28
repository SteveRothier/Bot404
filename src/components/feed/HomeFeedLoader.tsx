import { HomeFeedClient } from "@/components/feed/HomeFeedClient";
import { getHomeFeedTabBundle } from "@/lib/queries/feed";
import type { RequestAuth } from "@/lib/queries/shell";

type Props = {
  auth: RequestAuth;
  referenceNowMs: number;
};

export async function HomeFeedLoader({ auth, referenceNowMs }: Props) {
  const [forYou, following] = await Promise.all([
    getHomeFeedTabBundle("for-you", auth),
    getHomeFeedTabBundle("following", auth),
  ]);

  return (
    <HomeFeedClient
      recentPosts={forYou.posts}
      followingPosts={following.posts}
      suggestedNpcs={following.suggestedNpcs}
      user={auth.user}
      profile={auth.profile}
      bookmarkedPostIds={[
        ...new Set([
          ...forYou.bookmarkedPostIds,
          ...following.bookmarkedPostIds,
        ]),
      ]}
      commentsByPostId={{
        ...forYou.commentsByPostId,
        ...following.commentsByPostId,
      }}
      userReactionsByPostId={{
        ...forYou.userReactionsByPostId,
        ...following.userReactionsByPostId,
      }}
      likedCommentIds={[
        ...new Set([...forYou.likedCommentIds, ...following.likedCommentIds]),
      ]}
      bookmarkedCommentIds={[
        ...new Set([
          ...forYou.bookmarkedCommentIds,
          ...following.bookmarkedCommentIds,
        ]),
      ]}
      referenceNowMs={referenceNowMs}
    />
  );
}
