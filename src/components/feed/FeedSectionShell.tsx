"use client";

import { createContext, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FeedBridgeProvider,
} from "@/components/feed/FeedBridgeContext";
import {
  FeedFollowingContext,
} from "@/components/feed/FeedFollowingContext";
import { PostComposerForm } from "@/components/feed/PostComposerForm";
import { FeedTabs, type FeedTab } from "@/components/feed/FeedTabs";
import {
  feedTabToSearchParam,
  parseFeedTabParam,
} from "@/lib/feed/feed-tab-params";
import type { Profile } from "@/lib/supabase/types";

export const FeedTabContext = createContext<FeedTab>("for-you");

type Props = {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  initialTab?: FeedTab;
  children: React.ReactNode;
};

export function FeedSectionShell({
  user,
  profile,
  initialTab = "for-you",
  children,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<FeedTab>(initialTab);
  const [followingHasPosts, setFollowingHasPosts] = useState(true);

  useEffect(() => {
    setTab(parseFeedTabParam(searchParams.get("tab")));
  }, [searchParams]);

  const handleTabChange = useCallback(
    (next: FeedTab) => {
      setTab(next);
      const params = new URLSearchParams(searchParams.toString());
      const param = feedTabToSearchParam(next);
      if (param) params.set("tab", param);
      else params.delete("tab");
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <FeedBridgeProvider>
      <FeedFollowingContext.Provider
        value={{ followingHasPosts, setFollowingHasPosts }}
      >
        <FeedTabContext.Provider value={tab}>
          <div className="w-full min-w-0">
            <FeedTabs value={tab} onChange={handleTabChange} />
            <PostComposerForm user={user} profile={profile} feedTab={tab} />
            <div
              id={`feed-panel-${tab}`}
              role="tabpanel"
              aria-labelledby={`feed-tab-${tab}`}
            >
              {children}
            </div>
          </div>
        </FeedTabContext.Provider>
      </FeedFollowingContext.Provider>
    </FeedBridgeProvider>
  );
}
