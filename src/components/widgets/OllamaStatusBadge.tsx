"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  initialOnline: boolean;
  initialModel: string;
};

export function OllamaStatusBadge({ initialOnline, initialModel }: Props) {
  const [online, setOnline] = useState(initialOnline);
  const [model, setModel] = useState(initialModel);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/ollama-status");
        const data = (await res.json()) as { online: boolean; model?: string };
        setOnline(data.online);
        if (data.model) setModel(data.model);
      } catch {
        setOnline(false);
      }
    }

    check();
    const id = window.setInterval(check, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <span className="text-[15px] text-muted-foreground">Ollama</span>
        <p className="truncate text-[13px] text-muted-foreground">{model}</p>
      </div>
      <span
        className={cn(
          "flex shrink-0 items-center gap-1.5 text-[13px] font-medium",
          online ? "text-emerald-500" : "text-muted-foreground"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "size-2 rounded-full",
            online ? "bg-emerald-500" : "bg-muted-foreground"
          )}
        />
        {online ? "Actif" : "Inactif"}
      </span>
    </div>
  );
}
