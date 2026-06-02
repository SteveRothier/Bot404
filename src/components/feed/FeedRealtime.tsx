"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const REFRESH_DEBOUNCE_MS = 400;

type Props = {
  children: React.ReactNode;
};

export function FeedRealtime({ children }: Props) {
  const router = useRouter();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    function scheduleRefresh() {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      refreshTimerRef.current = setTimeout(() => {
        router.refresh();
      }, REFRESH_DEBOUNCE_MS);
    }

    const channel = supabase
      .channel("feed-posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        scheduleRefresh
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments" },
        scheduleRefresh
      )
      .subscribe();

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [router]);

  return <>{children}</>;
}
