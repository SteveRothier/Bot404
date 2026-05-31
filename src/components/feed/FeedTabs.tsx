"use client";

import { cn } from "@/lib/utils";

export type FeedTab = "for-you" | "recent" | "following";

const tabs: { value: FeedTab; label: string }[] = [
  { value: "for-you", label: "Signaux" },
  { value: "following", label: "Suivis" },
  { value: "recent", label: "Live" },
];

type Props = {
  value: FeedTab;
  onChange: (v: FeedTab) => void;
};

export function FeedTabs({ value, onChange }: Props) {
  return (
    <nav
      className="flex border-b border-border"
      aria-label="Filtrer le feed"
    >
      {tabs.map((tab) => {
        const active = value === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              "relative flex-1 px-4 py-4 text-center text-[15px] transition-colors hover:bg-secondary/50",
              active
                ? "font-bold text-foreground"
                : "font-normal text-muted-foreground"
            )}
          >
            {tab.label}
            {active && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
