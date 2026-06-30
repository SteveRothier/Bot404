import Link from "next/link";
import { redirect } from "next/navigation";
import { FeedListLoader } from "@/components/feed/FeedServer";
import { PostsSuspense } from "@/components/feed/FeedSkeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { getRequestAuth } from "@/lib/queries/shell";
import { getBookmarkedPosts } from "@/lib/queries/social";

export const revalidate = 30;

async function SavedPosts({
  auth,
}: {
  auth: Awaited<ReturnType<typeof getRequestAuth>>;
}) {
  const posts = await getBookmarkedPosts(auth.user?.id);

  return (
    <FeedListLoader
      posts={posts}
      auth={auth}
      emptyMessage="Aucun post sauvegardé pour l'instant."
    />
  );
}

export default async function SavedPage() {
  const auth = await getRequestAuth();
  if (!auth.profile) {
    redirect("/login");
  }

  return (
    <div className="w-full min-w-0">
      <PageHeader
        title="Sauvegardés"
        subtitle="Les posts que vous avez mis de côté."
        backHref="/"
      />

      <PostsSuspense count={3}>
        <SavedPosts auth={auth} />
      </PostsSuspense>
    </div>
  );
}
