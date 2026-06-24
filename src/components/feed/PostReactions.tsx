"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Flag, Heart, Zap } from "lucide-react";
import { toggleReaction } from "@/app/actions/reactions";
import { applyReactionToggle, REACTION_LABELS } from "@/lib/reactions";
import { markFeedLiveRefresh } from "@/lib/feed/live-refresh";
import { formatCount } from "@/lib/format";
import { toast } from "@/stores/toast-store";
import { HoverTooltip } from "@/components/ui/hover-tooltip";
import { cn } from "@/lib/utils";
import type { ReactionKind } from "@/lib/supabase/types";

type Props = {
  postId: number;
  relayCount: number;
  amplifyCount: number;
  flagCount: number;
  userReaction: ReactionKind | null;
  isLoggedIn: boolean;
};

const icons = {
  relay: Heart,
  amplify: Zap,
  flag: Flag,
} as const;

const kinds: ReactionKind[] = ["relay", "amplify", "flag"];

export function PostReactions({
  postId,
  relayCount,
  amplifyCount,
  flagCount,
  userReaction,
  isLoggedIn,
}: Props) {
  const [active, setActive] = useState<ReactionKind | null>(userReaction);
  const [counts, setCounts] = useState({
    relay: relayCount,
    amplify: amplifyCount,
    flag: flagCount,
  });
  const [, startTransition] = useTransition();

  useEffect(() => {
    setActive(userReaction);
    setCounts({ relay: relayCount, amplify: amplifyCount, flag: flagCount });
  }, [userReaction, relayCount, amplifyCount, flagCount]);

  function countFor(kind: ReactionKind) {
    return counts[kind];
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        {kinds.map((kind) => {
          const Icon = icons[kind];
          const label = REACTION_LABELS[kind].label;
          return (
            <HoverTooltip key={kind} label={label}>
              <Link
                href="/login"
                className="flex items-center gap-1 rounded-full px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent"
              >
                <Icon className="size-[16px]" strokeWidth={1.75} />
                <span>{formatCount(countFor(kind))}</span>
              </Link>
            </HoverTooltip>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {kinds.map((kind) => {
        const Icon = icons[kind];
        const isActive = active === kind;
        const label = REACTION_LABELS[kind].label;
        return (
          <HoverTooltip key={kind} label={label}>
            <button
              type="button"
              aria-label={label}
              onClick={() => {
                const prevActive = active;
                const prevCounts = counts;
                const next = applyReactionToggle(prevActive, counts, kind);
                setActive(next.active);
                setCounts(next.counts);

                startTransition(async () => {
                  const result = await toggleReaction(postId, kind);
                  if (!("success" in result) || !result.success) {
                    setActive(prevActive);
                    setCounts(prevCounts);
                    toast("Impossible d'enregistrer la réaction.");
                    return;
                  }

                  markFeedLiveRefresh();

                  if (
                    result.factionFeedback &&
                    kind === "amplify" &&
                    prevActive !== kind
                  ) {
                    const { factionName, delta } = result.factionFeedback;
                    const sign = delta > 0 ? "+" : "";
                    toast(`${factionName} ${sign}${delta.toFixed(1)} %`);
                  }
                });
              }}
              className={cn(
                "flex items-center gap-1 rounded-full px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent",
                isActive && kind === "flag" && "text-destructive",
                isActive && kind === "relay" && "text-accent",
                isActive && kind === "amplify" && "text-accent"
              )}
            >
              <Icon
                className={cn(
                  "size-[16px]",
                  isActive && kind === "relay" && "fill-current",
                  isActive && kind !== "relay" && "fill-current/20"
                )}
                strokeWidth={1.75}
              />
              <span className="text-meta">{formatCount(countFor(kind))}</span>
            </button>
          </HoverTooltip>
        );
      })}
    </div>
  );
}
