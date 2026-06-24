"use client";

import { useEffect, useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toggleBookmark } from "@/app/actions/bookmarks";
import { HoverTooltip } from "@/components/ui/hover-tooltip";
import { toast } from "@/stores/toast-store";
import { cn } from "@/lib/utils";

type Props = {
  postId: number;
  bookmarkedByUser?: boolean;
  isLoggedIn?: boolean;
};

export function BookmarkButton({
  postId,
  bookmarkedByUser = false,
  isLoggedIn = false,
}: Props) {
  const [bookmarked, setBookmarked] = useState(bookmarkedByUser);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setBookmarked(bookmarkedByUser);
  }, [bookmarkedByUser]);

  if (!isLoggedIn) return null;

  const tooltipLabel = bookmarked
    ? "Retirer des sauvegardés"
    : "Sauvegarder";

  return (
    <HoverTooltip label={tooltipLabel}>
      <button
        type="button"
        onClick={() => {
          const prev = bookmarked;
          setBookmarked(!bookmarked);

          startTransition(async () => {
            const result = await toggleBookmark(postId);
            if (!("success" in result) || !result.success) {
              setBookmarked(prev);
              toast("Impossible de mettre à jour le signet.");
            }
          });
        }}
        aria-label={tooltipLabel}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent",
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
  );
}
