"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Flag, Heart, Zap } from "lucide-react";
import { toggleReaction } from "@/app/actions/reactions";
import { REACTION_LABELS } from "@/lib/reactions";
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
  const [pending, startTransition] = useTransition();

  function countFor(kind: ReactionKind) {
    return counts[kind];
  }

  function bump(kind: ReactionKind, delta: number) {
    setCounts((c) => ({
      ...c,
      [kind]: Math.max(0, c[kind] + delta),
    }));
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
          <HoverTooltip key={kind} label={label} disabled={pending}>
            <button
              type="button"
              disabled={pending}
              aria-label={label}
              onClick={() => {
                startTransition(async () => {
                  const prev = active;
                  const result = await toggleReaction(postId, kind);
                  if (!("success" in result) || !result.success) {
                    toast("Impossible d'enregistrer la réaction.");
                    return;
                  }

                  if (prev === kind) {
                    bump(kind, -1);
                    setActive(null);
                  } else {
                    if (prev) bump(prev, -1);
                    bump(kind, 1);
                    setActive(kind);
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
