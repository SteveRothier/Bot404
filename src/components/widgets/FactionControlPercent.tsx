"use client";

import { useFactionsStore } from "@/stores/factions-store";

type Props = {
  factionId: string;
  fallback: number;
  className?: string;
};

export function FactionControlPercent({
  factionId,
  fallback,
  className,
}: Props) {
  const percent = useFactionsStore(
    (s) => s.factions.find((f) => f.id === factionId)?.control_percent
  );

  return (
    <span className={className}>
      {Number(percent ?? fallback).toFixed(1)}%
    </span>
  );
}
