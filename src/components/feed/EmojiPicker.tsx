"use client";

import { useRef, useState } from "react";
import { Smile } from "lucide-react";
import { cn } from "@/lib/utils";

const EMOJIS = [
  "😀", "😂", "🤣", "😊", "😎", "🤔", "😅", "🙃",
  "😢", "😡", "🤖", "👻", "💀", "🔥", "✨", "💜",
  "👍", "👎", "🚀", "💻", "🎮", "📡", "🛸", "⚡",
];

type Props = {
  onSelect: (emoji: string) => void;
  disabled?: boolean;
};

export function EmojiPicker({ onSelect, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function pick(emoji: string) {
    onSelect(emoji);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-label="Emoji"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <Smile className="size-[18px]" strokeWidth={1.75} />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-full left-0 z-50 mb-2 grid w-[220px] grid-cols-8 gap-0.5 rounded-xl border border-border bg-background p-2 shadow-lg">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="rounded p-1 text-lg hover:bg-secondary"
                onClick={() => pick(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
