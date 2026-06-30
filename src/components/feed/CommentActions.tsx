"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Bookmark, Heart, MessageCircle } from "lucide-react";
import {
  toggleCommentBookmark,
  toggleCommentLike,
} from "@/app/actions/comment-engagement";
import { formatCount } from "@/lib/format";
import { HoverTooltip } from "@/components/ui/hover-tooltip";
import { toast } from "@/stores/toast-store";
import { cn } from "@/lib/utils";

type Props = {
  commentId: number;
  postId: number;
  relayCount: number;
  likedByUser?: boolean;
  bookmarkedByUser?: boolean;
  isLoggedIn?: boolean;
  onReply: () => void;
};

export function CommentActions({
  commentId,
  postId,
  relayCount,
  likedByUser = false,
  bookmarkedByUser = false,
  isLoggedIn = false,
  onReply,
}: Props) {
  const [liked, setLiked] = useState(likedByUser);
  const [bookmarked, setBookmarked] = useState(bookmarkedByUser);
  const [count, setCount] = useState(relayCount);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setLiked(likedByUser);
    setBookmarked(bookmarkedByUser);
    setCount(relayCount);
  }, [likedByUser, bookmarkedByUser, relayCount]);

  return (
    <div className="mt-2 flex w-full max-w-[425px] items-center justify-between text-muted-foreground">
      <HoverTooltip label="Répondre">
        <button
          type="button"
          aria-label="Répondre"
          onClick={onReply}
          className="flex items-center gap-1.5 rounded-full px-1 py-0.5 text-sm transition-colors hover:bg-accent/10 hover:text-accent"
        >
          <MessageCircle className="size-[18px]" strokeWidth={1.75} />
        </button>
      </HoverTooltip>

      {isLoggedIn ? (
        <HoverTooltip label="J'aime">
          <button
            type="button"
            aria-label="J'aime"
            onClick={() => {
              const prevLiked = liked;
              const prevCount = count;
              const nextLiked = !liked;
              setLiked(nextLiked);
              setCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));

              startTransition(async () => {
                const result = await toggleCommentLike(commentId, postId);
                if (!("success" in result) || !result.success) {
                  setLiked(prevLiked);
                  setCount(prevCount);
                  toast("Impossible d'enregistrer la réaction.");
                }
              });
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-1 py-0.5 text-sm transition-colors hover:bg-accent/10 hover:text-accent",
              liked && "text-accent"
            )}
          >
            <Heart
              className={cn("size-[18px]", liked && "fill-current")}
              strokeWidth={1.75}
            />
            <span className="text-meta">{formatCount(count)}</span>
          </button>
        </HoverTooltip>
      ) : (
        <HoverTooltip label="J'aime">
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-full px-1 py-0.5 text-sm transition-colors hover:bg-accent/10 hover:text-accent"
          >
            <Heart className="size-[18px]" strokeWidth={1.75} />
            <span className="text-meta">{formatCount(count)}</span>
          </Link>
        </HoverTooltip>
      )}

      {isLoggedIn ? (
        <HoverTooltip
          label={bookmarked ? "Retirer des sauvegardés" : "Sauvegarder"}
        >
          <button
            type="button"
            aria-label={
              bookmarked ? "Retirer des sauvegardés" : "Sauvegarder"
            }
            onClick={() => {
              const prev = bookmarked;
              setBookmarked(!bookmarked);

              startTransition(async () => {
                const result = await toggleCommentBookmark(commentId, postId);
                if (!("success" in result) || !result.success) {
                  setBookmarked(prev);
                  toast("Impossible de mettre à jour le signet.");
                }
              });
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-1 py-0.5 text-sm transition-colors hover:bg-accent/10 hover:text-accent",
              bookmarked && "text-accent"
            )}
          >
            <Bookmark
              className="size-[18px]"
              strokeWidth={1.75}
              fill={bookmarked ? "currentColor" : "none"}
            />
          </button>
        </HoverTooltip>
      ) : null}
    </div>
  );
}
