import type {
  Faction,
  FactionControlSnapshot,
  FactionControlSnapshotValue,
} from "@/lib/supabase/types";

export type ControlSeriesPoint = {
  t: number;
  percent: number;
};

export type ControlSeries = {
  slug: string;
  name: string;
  color: string;
  points: ControlSeriesPoint[];
};

export type ControlDeltaEntry = {
  recordedAt: string;
  slug: string;
  name: string;
  color: string;
  delta: number;
  from: number;
  to: number;
};

export function parseSnapshotValues(
  raw: unknown
): FactionControlSnapshotValue[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const slug = (entry as { slug?: unknown }).slug;
      const percent = (entry as { percent?: unknown }).percent;
      if (typeof slug !== "string") return null;
      const n = Number(percent);
      if (!Number.isFinite(n)) return null;
      return { slug, percent: n };
    })
    .filter((v): v is FactionControlSnapshotValue => v !== null);
}

export function snapshotsToSeries(
  snapshots: FactionControlSnapshot[],
  factions: Faction[]
): ControlSeries[] {
  const meta = new Map(
    factions.map((f) => [f.slug, { name: f.name, color: f.color }])
  );

  const bySlug = new Map<string, ControlSeriesPoint[]>();

  for (const snap of snapshots) {
    const t = new Date(snap.recorded_at).getTime();
    if (!Number.isFinite(t)) continue;

    for (const entry of snap.values) {
      if (!bySlug.has(entry.slug)) bySlug.set(entry.slug, []);
      bySlug.get(entry.slug)!.push({ t, percent: entry.percent });
    }
  }

  return factions.map((f) => ({
    slug: f.slug,
    name: f.name,
    color: f.color,
    points: bySlug.get(f.slug) ?? [],
  }));
}

export function downsampleSnapshotsHourly(
  snapshots: FactionControlSnapshot[]
): FactionControlSnapshot[] {
  if (snapshots.length === 0) return [];

  const buckets = new Map<string, FactionControlSnapshot>();

  for (const snap of snapshots) {
    const d = new Date(snap.recorded_at);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}-${d.getUTCHours()}`;
    buckets.set(key, snap);
  }

  return [...buckets.values()].sort(
    (a, b) =>
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );
}

function percentForSlug(
  values: FactionControlSnapshotValue[],
  slug: string
): number | null {
  const entry = values.find((v) => v.slug === slug);
  return entry ? entry.percent : null;
}

export function formatControlDelta(
  prev: FactionControlSnapshot,
  next: FactionControlSnapshot,
  factions: Faction[]
): ControlDeltaEntry[] {
  const entries: ControlDeltaEntry[] = [];

  for (const faction of factions) {
    const from = percentForSlug(prev.values, faction.slug);
    const to = percentForSlug(next.values, faction.slug);
    if (from === null || to === null) continue;

    const delta = Math.round((to - from) * 10) / 10;
    if (Math.abs(delta) < 0.1) continue;

    entries.push({
      recordedAt: next.recorded_at,
      slug: faction.slug,
      name: faction.name,
      color: faction.color,
      delta,
      from,
      to,
    });
  }

  return entries.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

export function significantControlChanges(
  snapshots: FactionControlSnapshot[],
  factions: Faction[],
  limit = 12
): ControlDeltaEntry[] {
  const changes: ControlDeltaEntry[] = [];

  for (let i = 1; i < snapshots.length; i++) {
    const deltas = formatControlDelta(
      snapshots[i - 1]!,
      snapshots[i]!,
      factions
    );
    changes.push(...deltas);
  }

  return changes
    .sort(
      (a, b) =>
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    )
    .slice(0, limit);
}

export function factionMetaFromSnapshots(
  snapshots: FactionControlSnapshot[],
  factions: Faction[]
): Map<string, { name: string; color: string }> {
  const meta = new Map(
    factions.map((f) => [f.slug, { name: f.name, color: f.color }])
  );
  for (const snap of snapshots) {
    for (const v of snap.values) {
      if (!meta.has(v.slug)) {
        meta.set(v.slug, { name: v.slug, color: "#888888" });
      }
    }
  }
  return meta;
}
