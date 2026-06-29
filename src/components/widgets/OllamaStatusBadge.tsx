"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useOllamaStore } from "@/stores/ollama-store";

type Props = {
  compact?: boolean;
};

function statusLabel(online: boolean, localOnly: boolean): string {
  if (online) return "Actif";
  if (localOnly) return "PC local";
  return "Inactif";
}

function statusClass(online: boolean, localOnly: boolean): string {
  if (online) return "text-accent";
  if (localOnly) return "text-amber-600 dark:text-amber-400";
  return "text-muted-foreground";
}

function dotClass(online: boolean, localOnly: boolean): string {
  if (online) return "bg-accent";
  if (localOnly) return "bg-amber-500";
  return "bg-muted-foreground";
}

export function OllamaStatusBadge({ compact = false }: Props) {
  const online = useOllamaStore((s) => s.online);
  const model = useOllamaStore((s) => s.model);
  const localOnly = useOllamaStore((s) => s.localOnly);

  useEffect(() => {
    void useOllamaStore.getState().refresh();
    useOllamaStore.getState().startPolling();
    return () => useOllamaStore.getState().stopPolling();
  }, []);

  const label = statusLabel(online, localOnly);
  const tone = statusClass(online, localOnly);
  const dot = dotClass(online, localOnly);

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-2 text-meta">
        <span className="min-w-0 truncate text-muted-foreground">
          Ollama · {model || "—"}
        </span>
        <span className={cn("flex shrink-0 items-center gap-1 font-medium", tone)}>
          <span aria-hidden className={cn("size-1.5 rounded-full", dot)} />
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <span className="text-[15px] text-muted-foreground">Ollama</span>
        <p className="truncate text-[13px] text-muted-foreground">
          {model || "—"}
        </p>
      </div>
      <span
        className={cn(
          "flex shrink-0 items-center gap-1.5 text-[13px] font-medium",
          tone
        )}
      >
        <span aria-hidden className={cn("size-2 rounded-full", dot)} />
        {label}
      </span>
    </div>
  );
}
