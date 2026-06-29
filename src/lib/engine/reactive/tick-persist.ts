import { createAdminClient } from "@/lib/supabase/admin";
import type { NarrativeTickResult } from "@/lib/engine/shared/types";

export type StoredTickRun = {
  id: number;
  handled: boolean;
  mode: string;
  duration_ms: number;
  ollama_calls: number;
  signals_attempted: number;
  signals_handled: number;
  ambient_reactions: number;
  comment_likes: number;
  errors: string[];
  detail: Record<string, unknown>;
  created_at: string;
};

export async function persistTickRun(result: NarrativeTickResult): Promise<void> {
  if (!result.metrics) return;

  const admin = createAdminClient();
  const { error } = await admin.from("narrative_tick_runs").insert({
    handled: result.handled,
    mode: result.mode,
    duration_ms: result.metrics.duration_ms,
    ollama_calls: result.metrics.ollama_calls,
    signals_attempted: result.metrics.signals_attempted ?? 0,
    signals_handled: result.metrics.signals_handled ?? 0,
    ambient_reactions: result.metrics.ambient_reactions ?? 0,
    comment_likes: result.metrics.comment_likes ?? 0,
    errors: result.metrics.errors,
    detail: result.detail ?? {},
  });

  if (error) {
    console.warn("[tick-persist]", error.message);
  }
}

export async function getLastTickRun(): Promise<StoredTickRun | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("narrative_tick_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    handled: data.handled,
    mode: data.mode,
    duration_ms: data.duration_ms,
    ollama_calls: data.ollama_calls,
    signals_attempted: data.signals_attempted,
    signals_handled: data.signals_handled,
    ambient_reactions: data.ambient_reactions,
    comment_likes: data.comment_likes,
    errors: Array.isArray(data.errors) ? (data.errors as string[]) : [],
    detail: (data.detail as Record<string, unknown>) ?? {},
    created_at: data.created_at,
  };
}
