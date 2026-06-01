"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { OllamaStatus } from "@/lib/ollama";
import type { Faction } from "@/lib/supabase/types";
import {
  startFactionsRealtime,
  stopFactionsRealtime,
  useFactionsStore,
} from "@/stores/factions-store";
import { useOllamaStore } from "@/stores/ollama-store";

type Props = {
  factions: Faction[];
  ollama: OllamaStatus;
  children: React.ReactNode;
};

function useFactionsRealtimeEnabled() {
  const pathname = usePathname();
  const [isXl, setIsXl] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1280px)");
    const update = () => setIsXl(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isXl || pathname.startsWith("/factions");
}

export function ClientStoresHydrator({ factions, ollama, children }: Props) {
  const factionsRealtimeEnabled = useFactionsRealtimeEnabled();

  useEffect(() => {
    useFactionsStore.getState().hydrate(factions);
    useOllamaStore.getState().hydrate(ollama);
  }, [factions, ollama]);

  useEffect(() => {
    useOllamaStore.getState().startPolling();
    return () => useOllamaStore.getState().stopPolling();
  }, []);

  useEffect(() => {
    if (factionsRealtimeEnabled) {
      startFactionsRealtime();
    } else {
      stopFactionsRealtime();
    }

    return () => stopFactionsRealtime();
  }, [factionsRealtimeEnabled]);

  return children;
}
