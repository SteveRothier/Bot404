"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { votePoll } from "@/app/actions/polls";
import {
  isPollExpired,
  pollPercentages,
  formatPollTimeRemaining,
} from "@/lib/polls";
import { cn } from "@/lib/utils";
import type { PostPoll } from "@/lib/supabase/types";

type Props = {
  poll: PostPoll;
  postId: number;
  isLoggedIn?: boolean;
  referenceNowMs?: number;
};

export function PostPoll({
  poll,
  postId,
  isLoggedIn = false,
  referenceNowMs = Date.now(),
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [localPoll, setLocalPoll] = useState(poll);

  useEffect(() => {
    setLocalPoll(poll);
  }, [poll]);

  const expired = isPollExpired(localPoll.ends_at, referenceNowMs);
  const timeRemaining = formatPollTimeRemaining(
    localPoll.ends_at,
    referenceNowMs
  );
  const voted = localPoll.user_vote_option_id != null;
  const showResults = voted || expired;
  const totalVotes = localPoll.options.reduce(
    (sum, o) => sum + o.votes_count,
    0
  );
  const percentages = pollPercentages(localPoll.options);

  function handleVote(optionId: number) {
    if (!isLoggedIn || expired || pending) return;
    if (localPoll.user_vote_option_id === optionId) return;

    const previous = localPoll;
    const nextOptions = localPoll.options.map((o) => {
      let count = o.votes_count;
      if (localPoll.user_vote_option_id === o.id) count -= 1;
      if (o.id === optionId) count += 1;
      return { ...o, votes_count: Math.max(0, count) };
    });
    setLocalPoll({
      ...localPoll,
      options: nextOptions,
      user_vote_option_id: optionId,
    });

    startTransition(async () => {
      const result = await votePoll(postId, optionId);
      if (result.error) {
        setLocalPoll(previous);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
      {localPoll.options.map((option, index) => {
        const isSelected = localPoll.user_vote_option_id === option.id;
        const pct = percentages[index] ?? 0;

        return (
          <button
            key={option.id}
            type="button"
            disabled={!isLoggedIn || expired || pending}
            onClick={() => handleVote(option.id)}
            className={cn(
              "relative w-full overflow-hidden rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
              expired || !isLoggedIn
                ? "cursor-default border-border"
                : "border-border hover:border-accent/50",
              isSelected && "border-accent"
            )}
          >
            {showResults && totalVotes > 0 && (
              <span
                className={cn(
                  "absolute inset-y-0 left-0 bg-accent/15",
                  isSelected && "bg-accent/25"
                )}
                style={{ width: `${pct}%` }}
                aria-hidden
              />
            )}
            <span className="relative flex items-center justify-between gap-2">
              <span className={cn("font-medium", isSelected && "text-accent")}>
                {option.label}
              </span>
              {showResults && (
                <span className="text-xs text-muted-foreground">
                  {totalVotes > 0 ? `${pct}%` : option.votes_count}
                </span>
              )}
            </span>
          </button>
        );
      })}

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>
          {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
        </span>
        <span>·</span>
        <span>{expired ? "Sondage terminé" : (timeRemaining ?? "Sondage actif")}</span>
        {!isLoggedIn && !expired && (
          <>
            <span>·</span>
            <Link href="/login" className="text-accent hover:underline">
              Connectez-vous pour voter
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
