"use client";

import { Image, List } from "lucide-react";
import type { ReactNode } from "react";
import { EmojiPicker } from "@/components/feed/EmojiPicker";
import { GifPicker } from "@/components/feed/GifPicker";
import {
  composerIconButtonClass,
  composerIconClass,
} from "@/components/feed/composer-toolbar-styles";
import { HoverTooltip } from "@/components/ui/hover-tooltip";

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
  const tooltipLabel = soon ? `${label} (bientôt)` : label;

  return (
    <HoverTooltip label={tooltipLabel} disabled={disabled || soon}>
      <button
        type="button"
        disabled={disabled || soon}
        onClick={onClick}
        aria-label={tooltipLabel}
        className={composerIconButtonClass}
      >
        {children}
      </button>
    </HoverTooltip>
  );
}

type Props = {
  onEmojiSelect: (emoji: string) => void;
  onMediaClick?: () => void;
  onGifSelect?: (gif: { url: string; previewUrl: string }) => void;
  onPollClick?: () => void;
  pollActive?: boolean;
  mediaDisabled?: boolean;
  disabled?: boolean;
};

export function ComposerToolbar({
  onEmojiSelect,
  onMediaClick,
  onGifSelect,
  onPollClick,
  pollActive = false,
  mediaDisabled = false,
  disabled,
}: Props) {
  return (
    <div className="flex items-center">
      <ComposerToolButton
        label="Média"
        disabled={disabled || mediaDisabled || pollActive}
        onClick={onMediaClick}
      >
        <Image className={composerIconClass} strokeWidth={1.75} />
      </ComposerToolButton>
      {onGifSelect && (
        <GifPicker
          onSelect={onGifSelect}
          disabled={disabled || mediaDisabled || pollActive}
        />
      )}
      {onPollClick && (
        <ComposerToolButton
          label="Sondage"
          disabled={disabled || mediaDisabled}
          onClick={onPollClick}
        >
          <List
            className={composerIconClass}
            strokeWidth={1.75}
            aria-hidden={pollActive}
          />
        </ComposerToolButton>
      )}
      <EmojiPicker onSelect={onEmojiSelect} disabled={disabled} />
    </div>
  );
}
