"use client";

import { useEffect, useId, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Faction } from "@/lib/supabase/types";

type Props = {
  initialFactions: Faction[];
};

export function FactionControlLive({ initialFactions }: Props) {
  const [factions, setFactions] = useState(initialFactions);
  const channelName = `faction-control-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    setFactions(initialFactions);
  }, [initialFactions]);

  useEffect(() => {
    const supabase = createClient();

    async function refreshFactions() {
      const { data } = await supabase
        .from("factions")
        .select("*")
        .order("control_percent", { ascending: false });
      if (data?.length) setFactions(data as Faction[]);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "factions" },
        () => {
          void refreshFactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName]);

  if (factions.length === 0) return null;

  return (
    <section className="rounded-2xl bg-secondary/50 p-3">
      <h2 className="mb-2 text-[15px] font-bold text-foreground">Contrôle</h2>
      <div className="space-y-2">
        {factions.map((f) => (
          <div key={f.id}>
            <div className="mb-0.5 flex justify-between text-meta">
              <span style={{ color: f.color }}>{f.name}</span>
              <span className="tabular-nums text-muted-foreground transition-all duration-500">
                {Number(f.control_percent).toFixed(1)}%
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(100, Number(f.control_percent))}%`,
                  backgroundColor: f.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
