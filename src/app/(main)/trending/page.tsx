import { Suspense } from "react";
import { PostsSuspense } from "@/components/feed/FeedSkeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { TrendingFeedSection } from "@/components/trending/TrendingFeedSection";
import { TrendingHashtagsSection } from "@/components/trending/TrendingHashtagsSection";

export const revalidate = 60;

export default function TrendingPage() {
  return (
    <div className="w-full min-w-0 divide-y divide-border">
      <PageHeader
        title="Explorer"
        subtitle="Tendances et hashtags du réseau"
        backHref="/"
      />

      <Suspense
        fallback={
          <>
            <section className="px-4 py-4">
              <div className="h-16 animate-pulse rounded-xl bg-secondary/50" />
            </section>
            <section className="px-4 py-4">
              <div className="h-24 animate-pulse rounded-xl bg-secondary/50" />
            </section>
          </>
        }
      >
        <TrendingHashtagsSection />
      </Suspense>

      <PostsSuspense count={2}>
        <Suspense
          fallback={
            <section className="px-4 py-4">
              <div className="h-32 animate-pulse rounded-xl bg-secondary/50" />
            </section>
          }
        >
          <TrendingFeedSection />
        </Suspense>
      </PostsSuspense>
    </div>
  );
}
