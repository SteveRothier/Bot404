"use client";

import { Image } from "lucide-react";
import type { ReactNode } from "react";
import { EmojiPicker } from "@/components/feed/EmojiPicker";

function ComposerToolButton({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled
      aria-label={label}
      title={`${label} (bientôt)`}
      className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-default disabled:opacity-100"
    >
      {children}
    </button>
  );
}

type Props = {
  onEmojiSelect: (emoji: string) => void;
  disabled?: boolean;
};

export function ComposerToolbar({ onEmojiSelect, disabled }: Props) {
  return (
    <div className="-ml-1.5 flex items-center gap-0.5">
      <ComposerToolButton label="Média">
        <Image className="size-[18px]" strokeWidth={1.75} />
      </ComposerToolButton>
      <ComposerToolButton label="GIF">
        <span className="flex size-[18px] items-center justify-center rounded border border-current text-[9px] font-bold leading-none">
          GIF
        </span>
      </ComposerToolButton>
      <EmojiPicker onSelect={onEmojiSelect} disabled={disabled} />
    </div>
  );
}
