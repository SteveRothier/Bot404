"use client";

import type { CSSProperties } from "react";
import Picker, {
  Categories,
  EmojiStyle,
  Theme,
  type CategoryIcons,
} from "emoji-picker-react";
import {
  Bus,
  Cat,
  Flag,
  Hamburger,
  History,
  Music,
  Shirt,
  Smile,
  Trophy,
} from "lucide-react";
import "@/components/feed/emoji-picker-overrides.css";

const CATEGORY_ICON_CLASS = "size-[18px]";

const lucideCategoryIcons: CategoryIcons = {
  [Categories.SUGGESTED]: (
    <History className={CATEGORY_ICON_CLASS} strokeWidth={1.75} />
  ),
  [Categories.SMILEYS_PEOPLE]: (
    <Smile className={CATEGORY_ICON_CLASS} strokeWidth={1.75} />
  ),
  [Categories.ANIMALS_NATURE]: (
    <Cat className={CATEGORY_ICON_CLASS} strokeWidth={1.75} />
  ),
  [Categories.FOOD_DRINK]: (
    <Hamburger className={CATEGORY_ICON_CLASS} strokeWidth={1.75} />
  ),
  [Categories.TRAVEL_PLACES]: (
    <Bus className={CATEGORY_ICON_CLASS} strokeWidth={1.75} />
  ),
  [Categories.ACTIVITIES]: (
    <Trophy className={CATEGORY_ICON_CLASS} strokeWidth={1.75} />
  ),
  [Categories.OBJECTS]: (
    <Shirt className={CATEGORY_ICON_CLASS} strokeWidth={1.75} />
  ),
  [Categories.SYMBOLS]: (
    <Music className={CATEGORY_ICON_CLASS} strokeWidth={1.75} />
  ),
  [Categories.FLAGS]: (
    <Flag className={CATEGORY_ICON_CLASS} strokeWidth={1.75} />
  ),
};

const pickerStyle = {
  "--epr-bg-color": "#120c14",
  "--epr-hover-bg-color": "#1e1220",
  "--epr-search-border-color": "#f43f5e",
  "--epr-search-input-bg-color": "#0b070d",
  "--epr-highlight-color": "#f43f5e",
  "--epr-category-icon-active-color": "#f43f5e",
  "--epr-header-padding": "4px 6px 0",
  "--epr-category-navigation-button-size": "26px",
  "--epr-search-bar-inner-padding": "8px",
  "--epr-search-input-padding": "8px 34px 8px 38px",
  "--epr-search-input-height": "36px",
  "--epr-horizontal-padding": "8px",
  "--epr-category-padding": "6px 8px",
  "--epr-focus-bg-color": "transparent",
  "--epr-emoji-hover-color": "#1e1220",
  "--epr-category-label-bg-color": "#120c14",
  "--epr-text-color": "#f0e8ec",
  "--epr-border-radius": "8px",
  "--epr-preview-height": "54px",
  "--epr-emoji-size": "24px",
  "--epr-emoji-padding": "7px",
} as CSSProperties;

type Props = {
  onSelect: (emoji: string) => void;
};

export default function EmojiPickerPanel({ onSelect }: Props) {
  return (
    <Picker
      theme={Theme.DARK}
      emojiStyle={EmojiStyle.NATIVE}
      categoryIcons={lucideCategoryIcons}
      lazyLoadEmojis
      autoFocusSearch={false}
      searchDisabled={false}
      skinTonesDisabled
      width={340}
      height={400}
      searchPlaceHolder="Chercher un emoji"
      previewConfig={{ showPreview: true }}
      onEmojiClick={(emojiData) => onSelect(emojiData.emoji)}
      style={pickerStyle}
    />
  );
}
