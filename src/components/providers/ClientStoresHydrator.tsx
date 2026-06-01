"use client";

import { useEffect } from "react";
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

export function ClientStoresHydrator({ factions, ollama, children }: Props) {
  useEffect(() => {
    startFactionsRealtime();
    useOllamaStore.getState().startPolling();

    return () => {
      stopFactionsRealtime();
      useOllamaStore.getState().stopPolling();
    };
  }, []);

  useEffect(() => {
    useFactionsStore.getState().hydrate(factions);
    useOllamaStore.getState().hydrate(ollama);
  }, [factions, ollama]);

  return children;
}
