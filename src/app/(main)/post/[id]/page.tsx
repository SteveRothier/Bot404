import { PostDetailLoader } from "@/components/feed/FeedServer";
import { PostsSuspense } from "@/components/feed/FeedSkeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { notFound } from "next/navigation";

export const revalidate = 30;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId)) notFound();

  return (
    <div className="w-full min-w-0">
      <PageHeader title="Post" backHref="/" backLabel="Retour au fil" />
      <PostsSuspense count={1}>
        <PostDetailLoader postId={postId} />
      </PostsSuspense>
    </div>
  );
}
