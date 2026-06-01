import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Faction } from "@/lib/supabase/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

type FactionsState = {
  factions: Faction[];
  hydrated: boolean;
  hydrate: (factions: Faction[]) => void;
  setFactions: (factions: Faction[]) => void;
};

export const useFactionsStore = create<FactionsState>((set) => ({
  factions: [],
  hydrated: false,
  hydrate: (factions) => set({ factions, hydrated: true }),
  setFactions: (factions) => set({ factions }),
}));

let realtimeChannel: RealtimeChannel | null = null;
let realtimeStarted = false;

async function refreshFactions() {
  const supabase = createClient();
  const { data } = await supabase
    .from("factions")
    .select("*")
    .order("control_percent", { ascending: false });
  if (data?.length) {
    useFactionsStore.getState().setFactions(data as Faction[]);
  }
}

export function startFactionsRealtime() {
  if (realtimeStarted) return;
  realtimeStarted = true;

  const supabase = createClient();
  realtimeChannel = supabase
    .channel("faction-control-global")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "factions" },
      () => {
        void refreshFactions();
      }
    )
    .subscribe();
}

export function stopFactionsRealtime() {
  if (!realtimeChannel) return;
  const supabase = createClient();
  supabase.removeChannel(realtimeChannel);
  realtimeChannel = null;
  realtimeStarted = false;
}
