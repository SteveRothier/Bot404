"use client";

import { useEffect, useRef } from "react";
import { recordPostView } from "@/app/actions/post-views";
import {
  hasRecordedPostView,
  markPostViewRecorded,
} from "@/lib/feed/post-views";

const FEED_VISIBLE_MS = 1000;

type Props = {
  postId: number;
  mode: "feed" | "detail";
  trackViews?: boolean;
  onRecorded?: (count: number) => void;
};

export function PostViewTracker({
  postId,
  mode,
  trackViews = true,
  onRecorded,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const recordedRef = useRef(false);

  useEffect(() => {
    if (!trackViews) return;
    if (recordedRef.current || hasRecordedPostView(postId)) return;

    function commitView() {
      if (recordedRef.current || hasRecordedPostView(postId)) return;
      recordedRef.current = true;
      markPostViewRecorded(postId);

      void recordPostView(postId).then((result) => {
        if ("viewCount" in result) {
          onRecorded?.(result.viewCount);
        }
      });
    }

    if (mode === "detail") {
      commitView();
      return;
    }

    const node = ref.current;
    if (!node) return;

    let visibleTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) {
          if (visibleTimer) {
            clearTimeout(visibleTimer);
            visibleTimer = null;
          }
          return;
        }

        if (visibleTimer) return;

        visibleTimer = setTimeout(() => {
          visibleTimer = null;
          commitView();
          observer.disconnect();
        }, FEED_VISIBLE_MS);
      },
      { threshold: 0.5 }
    );

    observer.observe(node);

    return () => {
      if (visibleTimer) clearTimeout(visibleTimer);
      observer.disconnect();
    };
  }, [postId, mode, trackViews, onRecorded]);

  if (!trackViews) return null;
  if (mode === "detail") return null;

  return (
    <span
      ref={ref}
      className="pointer-events-none absolute inset-0"
      aria-hidden
    />
  );
}
