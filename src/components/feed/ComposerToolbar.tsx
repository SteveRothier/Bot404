"use client";

import { Image } from "lucide-react";
import type { ReactNode } from "react";
import { EmojiPicker } from "@/components/feed/EmojiPicker";
import { GifPicker } from "@/components/feed/GifPicker";

function ComposerToolButton({
  label,
  children,
  disabled,
  onClick,
  soon = false,
}: {
  label: string;
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  soon?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled || soon}
      onClick={onClick}
      aria-label={label}
      title={soon ? `${label} (bientôt)` : label}
      className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-default disabled:opacity-100"
    >
      {children}
    </button>
  );
}

type Props = {
  onEmojiSelect: (emoji: string) => void;
  onMediaClick?: () => void;
  onGifSelect?: (gif: { url: string; previewUrl: string }) => void;
  disabled?: boolean;
};

export function ComposerToolbar({
  onEmojiSelect,
  onMediaClick,
  onGifSelect,
  disabled,
}: Props) {
  return (
    <div className="-ml-1.5 flex items-center gap-0.5">
      <ComposerToolButton
        label="Média"
        disabled={disabled}
        onClick={onMediaClick}
      >
        <Image className="size-[18px]" strokeWidth={1.75} />
      </ComposerToolButton>
      {onGifSelect && (
        <GifPicker onSelect={onGifSelect} disabled={disabled} />
      )}
      <EmojiPicker onSelect={onEmojiSelect} disabled={disabled} />
    </div>
  );
}
