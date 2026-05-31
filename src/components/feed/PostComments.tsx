"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { createComment } from "@/app/actions/posts";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommentDeleteButton } from "@/components/feed/CommentDeleteButton";
import { PostContent } from "@/components/feed/PostContent";
import { formatRelativeTimeShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CommentWithAuthor, Profile } from "@/lib/supabase/types";

type Props = {
  postId: number;
  replyToUsername: string;
  comments: CommentWithAuthor[];
  isLoggedIn: boolean;
  profile?: Profile | null;
  userId?: string;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  referenceNowMs?: number;
};

export function PostComments({
  postId,
  replyToUsername,
  comments,
  isLoggedIn,
  profile,
  userId,
  open,
  onOpenChange,
  referenceNowMs = Date.now(),
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const replyAvatar =
    profile?.avatar_url ??
    (userId
      ? `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${userId}`
      : undefined);

  const replyHandle = `@${replyToUsername.toLowerCase()}`;
  const canSubmit = content.trim().length > 0 && !pending;

  useEffect(() => {
    if (!open) {
      setExpanded(false);
      setContent("");
      setError(null);
    }
  }, [open]);

  function expandComposer() {
    setExpanded(true);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function collapseIfEmpty() {
    if (!content.trim()) setExpanded(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    const fd = new FormData();
    fd.set("content", content.trim());
    startTransition(async () => {
      const result = await createComment(postId, fd);
      if (result.error) setError(result.error);
      else {
        setContent("");
        setExpanded(false);
        onOpenChange?.(true);
      }
    });
  }

  if (!open) return null;

  return (
    <div className="mt-3 border-t border-border">
      <div className="border-b border-border py-3">
        {isLoggedIn ? (
          <form onSubmit={handleSubmit}>
            {expanded && (
              <p className="mb-2 text-sm text-muted-foreground">
                Répondre à{" "}
                <span className="text-accent">{replyHandle}</span>
              </p>
            )}

            <div className="flex items-start gap-3">
              <Avatar className="size-10 shrink-0 rounded-full">
                <AvatarImage
                  src={replyAvatar}
                  className="rounded-full object-cover"
                />
                <AvatarFallback className="rounded-full bg-secondary text-xs text-muted-foreground">
                  {profile?.username?.slice(0, 2) ?? "??"}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                {!expanded ? (
                  <button
                    type="button"
                    onClick={expandComposer}
                    className="w-full py-2 text-left text-[15px] text-muted-foreground hover:text-foreground"
                  >
                    Émettre une réponse
                  </button>
                ) : (
                  <>
                    <Textarea
                      ref={textareaRef}
                      name="content"
                      placeholder="Émettre une réponse"
                      maxLength={300}
                      disabled={pending}
                      rows={3}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onBlur={() => {
                        window.setTimeout(collapseIfEmpty, 120);
                      }}
                      className="min-h-[72px] resize-none border-0 bg-transparent px-0 py-1 text-[15px] text-foreground shadow-none placeholder:text-muted-foreground focus-visible:border-0 focus-visible:ring-0"
                    />

                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={!canSubmit}
                        onMouseDown={(e) => e.preventDefault()}
                        className={cn(
                          "h-8 rounded-full px-4 text-sm font-bold transition-colors",
                          canSubmit
                            ? "bg-accent text-accent-foreground hover:bg-accent/90"
                            : "cursor-not-allowed bg-secondary text-muted-foreground"
                        )}
                      >
                        {pending ? "..." : "Répondre"}
                      </button>
                    </div>
                  </>
                )}

                {error && (
                  <p className="mt-1 text-xs text-destructive">{error}</p>
                )}
              </div>
            </div>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="text-accent hover:underline">
              Connectez-vous
            </Link>{" "}
            pour répondre.
          </p>
        )}
      </div>

      {comments.length === 0 ? (
        <p className="py-3 text-sm text-muted-foreground">
          Aucun commentaire pour l&apos;instant.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {comments.map((c) => {
            const handle = `@${c.author.username.toLowerCase()}`;
            return (
              <article
                key={c.id}
                className="surface-hover flex items-start gap-3 py-3"
              >
                <Link
                  href={`/profile/${c.author.username}`}
                  className="shrink-0 self-start"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Avatar className="size-10 rounded-full">
                    <AvatarImage
                      src={c.author.avatar_url ?? undefined}
                      alt={c.author.username}
                      className="rounded-full object-cover"
                    />
                    <AvatarFallback className="rounded-full bg-secondary text-xs text-muted-foreground">
                      {c.author.username.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1 text-[15px]">
                    <Link
                      href={`/profile/${c.author.username}`}
                      className="font-bold text-foreground hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {c.author.username}
                    </Link>
                    <span className="text-muted-foreground">{handle}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                      {formatRelativeTimeShort(c.created_at, referenceNowMs)}
                    </span>
                    <CommentDeleteButton
                      commentId={c.id}
                      postId={postId}
                      canDelete={!!userId && userId === c.author_id}
                    />
                  </div>
                  <PostContent
                    content={c.content}
                    className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground"
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
