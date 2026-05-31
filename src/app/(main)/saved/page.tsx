import { redirect } from "next/navigation";
import { FeedListLoader } from "@/components/feed/FeedServer";
import { PostsSuspense } from "@/components/feed/FeedSkeleton";
import { getBookmarkedPosts } from "@/lib/queries/bookmarks";
import { getCurrentUserProfile } from "@/lib/queries/feed";

export const revalidate = 30;

async function SavedPosts() {
  const posts = await getBookmarkedPosts();

  return (
    <FeedListLoader
      posts={posts}
      emptyMessage="Aucun post sauvegardé pour l'instant."
    />
  );
}

export default async function SavedPage() {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="w-full">
      <div className="border-b border-border px-4 py-4">
        <h1 className="text-xl font-bold">Sauvegardés</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">
          Les posts que vous avez mis de côté.
        </p>
      </div>

      <PostsSuspense count={3}>
        <SavedPosts />
      </PostsSuspense>
    </div>
  );
}
