"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { feedLiveRefreshActive } from "@/lib/feed/live-refresh";

const REFRESH_INTERVAL_MS = 30_000;

export function FeedLiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    const id = window.setInterval(() => {
      if (feedLiveRefreshActive()) {
        router.refresh();
      }
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [router]);

  return null;
}
