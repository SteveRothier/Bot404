import { HomeFeedClient } from "@/components/feed/HomeFeedClient";
import { getHomeFeedTabBundle } from "@/lib/queries/feed";
import type { RequestAuth } from "@/lib/queries/auth";

type Props = {
  auth: RequestAuth;
  referenceNowMs: number;
};

export async function HomeFeedLoader({ auth, referenceNowMs }: Props) {
  const [forYou, theory, rumor, following] = await Promise.all([
    getHomeFeedTabBundle("for-you", auth),
    getHomeFeedTabBundle("theory", auth),
    getHomeFeedTabBundle("rumor", auth),
    getHomeFeedTabBundle("following", auth),
  ]);

  return (
    <HomeFeedClient
      recentPosts={forYou.posts}
      theoryPosts={theory.posts}
      rumorPosts={rumor.posts}
      followingPosts={following.posts}
      suggestedNpcs={following.suggestedNpcs}
      user={auth.user}
      profile={auth.profile}
      bookmarkedPostIds={[
        ...new Set([
          ...forYou.bookmarkedPostIds,
          ...theory.bookmarkedPostIds,
          ...rumor.bookmarkedPostIds,
          ...following.bookmarkedPostIds,
        ]),
      ]}
      commentsByPostId={{
        ...forYou.commentsByPostId,
        ...theory.commentsByPostId,
        ...rumor.commentsByPostId,
        ...following.commentsByPostId,
      }}
      userReactionsByPostId={{
        ...forYou.userReactionsByPostId,
        ...theory.userReactionsByPostId,
        ...rumor.userReactionsByPostId,
        ...following.userReactionsByPostId,
      }}
      referenceNowMs={referenceNowMs}
    />
  );
}
