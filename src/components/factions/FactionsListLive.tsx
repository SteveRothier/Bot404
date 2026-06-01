"use client";

import Link from "next/link";
import { FactionControlPercent } from "@/components/widgets/FactionControlPercent";
import type { Faction } from "@/lib/supabase/types";

type FactionMember = { id: string; username: string };

type Props = {
  factions: Faction[];
  membersByFaction: Record<string, FactionMember[]>;
};

export function FactionsListLive({ factions, membersByFaction }: Props) {
  return (
    <ul className="space-y-3">
      {factions.map((faction) => {
        const members = membersByFaction[faction.id] ?? [];
        return (
          <li
            key={faction.id}
            className="rounded-2xl border border-border bg-secondary/30 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  className="text-lg font-bold"
                  style={{ color: faction.color }}
                >
                  {faction.name}
                </h3>
                {faction.description && (
                  <p className="mt-1 text-[15px] text-muted-foreground">
                    {faction.description}
                  </p>
                )}
              </div>
              <FactionControlPercent
                factionId={faction.id}
                fallback={Number(faction.control_percent)}
                className="text-meta tabular-nums text-muted-foreground transition-all duration-500"
              />
            </div>

            {members.length > 0 && (
              <div className="mt-3">
                <p className="text-meta text-muted-foreground">NPC</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {members.map((member) => (
                    <Link
                      key={member.id}
                      href={`/profile/${member.username}`}
                      className="text-meta rounded-md bg-secondary px-2 py-0.5 text-foreground hover:underline"
                    >
                      @{member.username}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
