import { createAdminClient } from "@/lib/supabase/admin";
import {
  downsampleSnapshotsHourly,
  parseSnapshotValues,
} from "@/lib/factions/control-history";
import type { FactionControlSnapshot } from "@/lib/supabase/types";

function normalizeSnapshot(row: {
  id: number;
  recorded_at: string;
  values: unknown;
}): FactionControlSnapshot {
  return {
    id: row.id,
    recorded_at: row.recorded_at,
    values: parseSnapshotValues(row.values),
  };
}

export async function getLatestFactionControlSnapshot(): Promise<FactionControlSnapshot | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("faction_control_snapshots")
    .select("id, recorded_at, values")
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return normalizeSnapshot(data);
}

export async function getFactionControlSnapshots(
  range: "24h" | "7d"
): Promise<FactionControlSnapshot[]> {
  const supabase = createAdminClient();
  const sinceMs =
    range === "24h"
      ? Date.now() - 24 * 60 * 60 * 1000
      : Date.now() - 7 * 24 * 60 * 60 * 1000;
  const since = new Date(sinceMs).toISOString();

  const { data } = await supabase
    .from("faction_control_snapshots")
    .select("id, recorded_at, values")
    .gte("recorded_at", since)
    .order("recorded_at", { ascending: true })
    .limit(range === "24h" ? 300 : 2000);

  if (!data?.length) return [];

  const snapshots = data.map(normalizeSnapshot);
  return range === "7d" ? downsampleSnapshotsHourly(snapshots) : snapshots;
}

export async function getFactionControlHistoryForTimeline(
  limit = 50
): Promise<FactionControlSnapshot[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("faction_control_snapshots")
    .select("id, recorded_at, values")
    .order("recorded_at", { ascending: true })
    .limit(limit);

  if (!data?.length) return [];
  return data.map(normalizeSnapshot);
}
