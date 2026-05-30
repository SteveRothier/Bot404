"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import Link from "next/link";
import { toggleLike } from "@/app/actions/posts";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  postId: number;
  likesCount: number;
  likedByUser: boolean;
  isLoggedIn: boolean;
};

export function LikeButton({
  postId,
  likesCount,
  likedByUser,
  isLoggedIn,
}: Props) {
  const [liked, setLiked] = useState(likedByUser);
  const [count, setCount] = useState(likesCount);
  const [pending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 text-sm text-[#6b7280] transition-colors hover:text-[#fb7185]"
      >
        <Heart className="size-[18px]" strokeWidth={1.75} />
        <span>{formatCount(count)}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await toggleLike(postId);
          if (result.success) {
            setLiked(!!result.liked);
            setCount((c) => (result.liked ? c + 1 : Math.max(c - 1, 0)));
          }
        });
      }}
      className={cn(
        "flex items-center gap-1.5 text-sm text-[#6b7280] transition-colors hover:text-[#fb7185]",
        liked && "text-[#fb7185]"
      )}
    >
      <Heart
        className={cn("size-[18px]", liked && "fill-current")}
        strokeWidth={1.75}
      />
      <span>{formatCount(count)}</span>
    </button>
  );
}
