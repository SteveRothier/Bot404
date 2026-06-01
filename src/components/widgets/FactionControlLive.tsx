"use client";

import { useFactionsStore } from "@/stores/factions-store";

export function FactionControlLive() {
  const factions = useFactionsStore((s) => s.factions);

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
