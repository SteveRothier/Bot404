"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { forceNarrativeTickAction } from "@/app/actions/narrative-admin";
import { Button } from "@/components/ui/button";

type PendingSignal = {
  id: number;
  kind: string;
  priority: number;
  status: string;
  attempt_count: number;
  created_at: string;
  post_id: number | null;
  payload: Record<string, unknown>;
};

type Props = {
  signals: PendingSignal[];
};

export function NarrativeOpsPanel({ signals }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleForceTick() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await forceNarrativeTickAction();
      if ("error" in result) {
        setError(result.error ?? "Erreur");
        return;
      }
      const mode = result.result.mode;
      const handled = result.result.handled;
      setMessage(
        handled
          ? `Tick OK — mode ${mode}.`
          : `Tick terminé — rien à traiter (mode ${mode}).`
      );
      router.refresh();
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-dashed border-violet-500/30 bg-violet-500/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-bold">Ops narration</h2>
          <p className="text-sm text-muted-foreground">
            Contrôles développeur (NARRATIVE_ADMIN=1)
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={handleForceTick}
          className="rounded-full"
        >
          {pending ? "Tick…" : "Forcer un tick"}
        </Button>
      </div>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div>
        <h3 className="mb-2 text-meta font-semibold uppercase tracking-wide text-muted-foreground">
          Signaux en attente ({signals.length})
        </h3>
        {signals.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun signal pending.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {signals.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap gap-x-2 gap-y-0.5 rounded-lg bg-secondary/50 px-2 py-1.5"
              >
                <span className="font-medium">#{s.id}</span>
                <span>{s.kind}</span>
                <span className="text-muted-foreground">prio {s.priority}</span>
                {s.attempt_count > 0 && (
                  <span className="text-muted-foreground">
                    essais {s.attempt_count}
                  </span>
                )}
                {typeof s.payload.post_type === "string" && (
                  <span className="text-accent">{s.payload.post_type}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
