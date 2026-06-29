import { create } from "zustand";
import { checkOllamaStatusClient, type OllamaStatus } from "@/lib/ollama";

type OllamaState = {
  online: boolean;
  model: string;
  localOnly: boolean;
  hydrate: (status: OllamaStatus) => void;
  refresh: () => Promise<boolean>;
  startPolling: () => void;
  stopPolling: () => void;
};

let pollingId: number | null = null;

export const useOllamaStore = create<OllamaState>((set, get) => ({
  online: false,
  model: "",
  localOnly: false,
  hydrate: (status) =>
    set({
      online: status.online,
      model: status.model,
      localOnly: status.localOnly ?? false,
    }),
  refresh: async () => {
    const status = await checkOllamaStatusClient(get().model);
    set({
      online: status.online,
      model: status.model,
      localOnly: status.localOnly ?? false,
    });
    return status.online;
  },
  startPolling: () => {
    if (pollingId !== null) return;
    pollingId = window.setInterval(() => {
      void get().refresh();
    }, 30_000);
  },
  stopPolling: () => {
    if (pollingId === null) return;
    window.clearInterval(pollingId);
    pollingId = null;
  },
}));
