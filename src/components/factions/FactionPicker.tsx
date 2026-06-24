"use client";

import { cn } from "@/lib/utils";
import type { Faction } from "@/lib/supabase/types";

type Props = {
  factions: Faction[];
  value: string | null;
  onChange: (factionId: string) => void;
  disabled?: boolean;
  name?: string;
  required?: boolean;
};

export function FactionPicker({
  factions,
  value,
  onChange,
  disabled = false,
  name = "faction_id",
  required = false,
}: Props) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {factions.map((faction) => {
        const selected = value === faction.id;
        return (
          <label
            key={faction.id}
            className={cn(
              "cursor-pointer rounded-xl border p-3 transition-colors",
              selected
                ? "border-current bg-secondary/40"
                : "border-border bg-secondary/20 hover:bg-secondary/30",
              disabled && "pointer-events-none opacity-60"
            )}
            style={selected ? { borderColor: faction.color } : undefined}
          >
            <input
              type="radio"
              name={name}
              value={faction.id}
              checked={selected}
              required={required}
              disabled={disabled}
              className="sr-only"
              onChange={() => onChange(faction.id)}
            />
            <span
              className="block text-sm font-bold"
              style={{ color: faction.color }}
            >
              {faction.name}
            </span>
            {faction.description && (
              <span className="mt-1 block text-meta text-muted-foreground">
                {faction.description}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}
