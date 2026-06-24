"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FactionsListLive } from "@/components/factions/FactionsListLive";
import type { Faction } from "@/lib/supabase/types";

type FactionMember = { id: string; username: string };

type Props = {
  factions: Faction[];
  initialMembersByFaction: Record<string, FactionMember[]>;
};

async function fetchNpcMembersByFaction(): Promise<
  Record<string, FactionMember[]>
> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, faction_id")
    .eq("is_npc", true)
    .not("faction_id", "is", null);

  const grouped: Record<string, FactionMember[]> = {};
  for (const profile of data ?? []) {
    if (!profile.faction_id) continue;
    if (!grouped[profile.faction_id]) grouped[profile.faction_id] = [];
    grouped[profile.faction_id].push({
      id: profile.id,
      username: profile.username,
    });
  }

  for (const members of Object.values(grouped)) {
    members.sort((a, b) => a.username.localeCompare(b.username));
  }

  return grouped;
}

export function FactionMembersLive({
  factions,
  initialMembersByFaction,
}: Props) {
  const [membersByFaction, setMembersByFaction] = useState(
    initialMembersByFaction
  );

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("faction-members-live")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        () => {
          void fetchNpcMembersByFaction().then(setMembersByFaction);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <FactionsListLive factions={factions} membersByFaction={membersByFaction} />
  );
}
