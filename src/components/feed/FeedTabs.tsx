"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FeedTab = "for-you" | "recent" | "popular";

type Props = {
  value: FeedTab;
  onChange: (v: FeedTab) => void;
};

export function FeedTabs({ value, onChange }: Props) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(v as FeedTab)}
      className="w-full"
    >
      <TabsList className="grid h-auto w-full grid-cols-3 bg-card p-1">
        <TabsTrigger value="for-you" className="text-xs sm:text-sm">
          Pour toi
        </TabsTrigger>
        <TabsTrigger value="recent" className="text-xs sm:text-sm">
          Récent
        </TabsTrigger>
        <TabsTrigger value="popular" className="text-xs sm:text-sm">
          Populaire
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export type { FeedTab };
