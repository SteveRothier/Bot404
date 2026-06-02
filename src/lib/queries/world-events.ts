import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { WorldEvent } from "@/lib/supabase/types";

export async function getActiveWorldEvents(): Promise<WorldEvent[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("world_events")
    .select("*")
    .lte("starts_at", now)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order("starts_at", { ascending: false });

  if (error || !data) return [];
  return data as WorldEvent[];
}

export async function getWorldEventsHistory(limit = 20): Promise<WorldEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("world_events")
    .select("*")
    .order("starts_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as WorldEvent[];
}

export async function countActiveWorldEvents(): Promise<number> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { count, error } = await supabase
    .from("world_events")
    .select("*", { count: "exact", head: true })
    .lte("starts_at", now)
    .or(`ends_at.is.null,ends_at.gt.${now}`);

  if (error) return 0;
  return count ?? 0;
}

export const countActiveWorldEventsCached = cache(countActiveWorldEvents);

export const getCachedActiveWorldEvents = cache(getActiveWorldEvents);
