import { FeedListLoader } from "@/components/feed/FeedServer";
import { PostsSuspense } from "@/components/feed/FeedSkeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { normalizeHashtag } from "@/lib/hashtags";
import { getPostsByHashtag } from "@/lib/queries/explore";

export const revalidate = 60;

type Props = {
  params: Promise<{ tag: string }>;
};

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const displayTag = normalizeHashtag(decodeURIComponent(tag));

  return (
    <div className="w-full min-w-0">
      <PageHeader
        title={displayTag}
        subtitle="Posts contenant ce hashtag"
        backHref="/trending"
        backLabel="Retour à Explorer"
      />

      <PostsSuspense>
        <TagFeed tag={tag} />
      </PostsSuspense>
    </div>
  );
}

async function TagFeed({ tag }: { tag: string }) {
  const posts = await getPostsByHashtag(tag);
  return (
    <FeedListLoader
      posts={posts}
      emptyMessage={`Aucun post pour ${normalizeHashtag(decodeURIComponent(tag))}.`}
    />
  );
}
