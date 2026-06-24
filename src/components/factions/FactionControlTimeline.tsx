import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { significantControlChanges } from "@/lib/factions/control-history";
import type { Faction, FactionControlSnapshot } from "@/lib/supabase/types";

type Props = {
  snapshots: FactionControlSnapshot[];
  factions: Faction[];
};

function formatDelta(delta: number): string {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)} %`;
}

export function FactionControlTimeline({ snapshots, factions }: Props) {
  const changes = significantControlChanges(snapshots, factions, 12);

  if (changes.length === 0) {
    return (
      <p className="mt-4 text-meta text-muted-foreground">
        Aucun changement significatif enregistré pour le moment.
      </p>
    );
  }

  return (
    <ul className="mt-4 space-y-2">
      {changes.map((entry, i) => (
        <li
          key={`${entry.recordedAt}-${entry.slug}-${i}`}
          className="flex flex-wrap items-baseline gap-x-2 rounded-lg border border-border px-3 py-2 text-meta"
        >
          <span className="text-muted-foreground">
            {formatDistanceToNow(new Date(entry.recordedAt), {
              addSuffix: true,
              locale: fr,
            })}
          </span>
          <span className="font-medium" style={{ color: entry.color }}>
            {entry.name}
          </span>
          <span
            className={
              entry.delta > 0
                ? "tabular-nums text-emerald-600 dark:text-emerald-400"
                : "tabular-nums text-rose-600 dark:text-rose-400"
            }
          >
            {formatDelta(entry.delta)}
          </span>
          <span className="tabular-nums text-muted-foreground">
            ({entry.from.toFixed(1)} → {entry.to.toFixed(1)})
          </span>
        </li>
      ))}
    </ul>
  );
}
