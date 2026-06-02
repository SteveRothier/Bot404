import { PostsSkeleton } from "@/components/feed/FeedSkeleton";

export default function MainLoading() {
  return (
    <div className="w-full">
      <div className="h-12 border-b border-border" />
      <PostsSkeleton count={4} />
    </div>
  );
}
