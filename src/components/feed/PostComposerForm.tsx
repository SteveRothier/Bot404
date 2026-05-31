"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CalendarClock,
  CircleSlash,
  Flag,
  Image,
  List,
  MapPin,
  Smile,
  type LucideIcon,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createPost } from "@/app/actions/posts";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/supabase/types";

type Props = {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
};

const composerTools: { icon: LucideIcon; label: string }[] = [
  { icon: Image, label: "Média" },
  { icon: CircleSlash, label: "Sondage" },
  { icon: List, label: "Liste" },
  { icon: Smile, label: "Emoji" },
  { icon: CalendarClock, label: "Programmer" },
  { icon: MapPin, label: "Lieu" },
  { icon: Flag, label: "Signaler" },
];

function ComposerToolbar() {
  return (
    <div className="-ml-1.5 flex flex-wrap items-center gap-0.5">
      <ComposerToolButton icon={Image} label="Média" />
      <ComposerGifButton />
      {composerTools.slice(1).map((tool) => (
        <ComposerToolButton key={tool.label} icon={tool.icon} label={tool.label} />
      ))}
    </div>
  );
}

function ComposerToolButton({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled
      aria-label={label}
      title={`${label} (bientôt)`}
      className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-default disabled:opacity-100"
    >
      <Icon className="size-[18px]" strokeWidth={1.75} />
    </button>
  );
}

function ComposerGifButton() {
  return (
    <button
      type="button"
      disabled
      aria-label="GIF"
      title="GIF (bientôt)"
      className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-default disabled:opacity-100"
    >
      <span className="flex size-[18px] items-center justify-center rounded border border-current text-[9px] font-bold leading-none">
        GIF
      </span>
    </button>
  );
}

export function PostComposerForm({ user, profile }: Props) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const avatar =
    profile?.avatar_url ??
    (user
      ? `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.id}`
      : "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=guest");

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
          <AvatarFallback className="rounded-lg bg-secondary text-xs text-muted-foreground">
            {profile?.username?.slice(0, 2) ?? "??"}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <Textarea
            placeholder="Émettre un signal…"
            className="min-h-[52px] resize-none border-0 bg-transparent px-1 pb-3 pt-2 text-[17px] leading-6 text-foreground shadow-none placeholder:text-muted-foreground focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
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
              <Button
                type="submit"
                disabled={pending || !content.trim()}
                className={cn(
                  "h-9 shrink-0 rounded-full px-5 text-[15px] font-bold transition-colors",
                  content.trim() && !pending
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : "bg-accent/40 text-accent-foreground/70 hover:bg-accent/40"
                )}
              >
                {pending ? "..." : "Émettre"}
              </Button>
            ) : (
              <Link
                href="/login"
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-accent px-5 text-[15px] font-bold text-accent-foreground hover:bg-accent/90"
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
