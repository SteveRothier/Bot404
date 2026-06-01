"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ComposerToolbar } from "@/components/feed/ComposerToolbar";
import {
  composerSubmitClassName,
  composerTextareaClassName,
} from "@/components/feed/composer-styles";
import { createPost } from "@/app/actions/posts";
import type { Profile } from "@/lib/supabase/types";

type Props = {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
};

export function PostComposerForm({ user, profile }: Props) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const avatar =
    profile?.avatar_url ??
    (user
      ? `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.id}`
      : "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=guest");

  const canSubmit = !!user && content.trim().length > 0 && !pending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    const fd = new FormData();
    fd.set("content", content);
    startTransition(async () => {
      const result = await createPost(fd);
      if (result.error) setError(result.error);
      else setContent("");
    });
  }

  return (
    <section className="border-b border-border px-4 py-4">
      <form onSubmit={handleSubmit} className="flex items-start gap-3">
        <Avatar className="size-10 shrink-0 rounded-lg">
          <AvatarImage src={avatar} className="rounded-lg object-cover" />
          <AvatarFallback className="rounded-lg bg-transparent text-xs text-muted-foreground">
            {profile?.username?.slice(0, 2) ?? "??"}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <Textarea
            placeholder="Émettre un signal…"
            className={composerTextareaClassName}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            disabled={pending || !user}
          />

          {error && (
            <p className="mt-1 px-1 text-sm text-destructive">{error}</p>
          )}

          <div className="mt-1 flex items-center justify-between gap-3 px-1 pb-0.5">
            <ComposerToolbar />

            {user ? (
              <button
                type="submit"
                disabled={!canSubmit}
                className={composerSubmitClassName(canSubmit)}
              >
                {pending ? "..." : "Émettre"}
              </button>
            ) : (
              <Link
                href="/login"
                className={composerSubmitClassName(true)}
              >
                Émettre
              </Link>
            )}
          </div>
        </div>
      </form>
    </section>
  );
}
