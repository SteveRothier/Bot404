"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "loading" | "online" | "offline";

export function OllamaStatusBadge() {
  const [status, setStatus] = useState<Status>("loading");
  const [model, setModel] = useState("qwen3.5:4b");

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/ollama-status");
        const data = (await res.json()) as { online: boolean; model?: string };
        setStatus(data.online ? "online" : "offline");
        if (data.model) setModel(data.model);
      } catch {
        setStatus("offline");
      }
    }

    check();
    const id = window.setInterval(check, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <span className="text-sm text-[#9ca3af]">IA locale (Ollama)</span>
        <p className="truncate text-[11px] text-[#6b7280]">{model}</p>
      </div>
      <Badge
        variant="outline"
        className={cn(
          "shrink-0 border text-[10px] font-bold uppercase",
          status === "loading" && "border-[#374151] bg-[#1f2937] text-[#9ca3af]",
          status === "online" &&
            "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
          status === "offline" &&
            "border-[#7f1d1d] bg-[#2b0b13] text-[#fda4af]"
        )}
      >
        {status === "loading"
          ? "..."
          : status === "online"
            ? "Allumée"
            : "Éteinte"}
      </Badge>
    </div>
  );
}
