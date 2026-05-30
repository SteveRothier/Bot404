"use client";

import { cn } from "@/lib/utils";

export type FeedTab =
  | "for-you"
  | "recent"
  | "following"
  | "rumors"
  | "theories";

const tabs: { value: FeedTab; label: string }[] = [
  { value: "for-you", label: "Pour vous" },
  { value: "recent", label: "Récent" },
  { value: "following", label: "Suivis" },
  { value: "rumors", label: "Rumeurs" },
  { value: "theories", label: "Théories" },
];

type Props = {
  value: FeedTab;
  onChange: (v: FeedTab) => void;
};

export function FeedTabs({ value, onChange }: Props) {
  return (
    <nav
      className="flex border-b border-[#24101a]"
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
              "relative flex-1 px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-wide transition-colors sm:text-xs",
              active
                ? "text-foreground"
                : "text-[#6b7280] hover:text-[#9ca3af]"
            )}
          >
            {tab.label}
            {active && (
              <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-[#e11d48]" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
