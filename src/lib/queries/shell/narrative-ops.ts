import { getSignalsPerTick } from "@/lib/engine/reactive/tick-config";
import { readLastTickResult } from "@/lib/engine/reactive/last-tick";
import { getNpcGenerationStatus } from "@/lib/engine/shared/generation-gate";
import {
  getActiveEmergentArc,
  getNarrativeStateForUi,
} from "@/lib/engine/shared/queries";
import { createAdminClient } from "@/lib/supabase/admin";

export type NpcOpsSnapshot = {
  generation: ReturnType<typeof getNpcGenerationStatus>;
  narrative: Awaited<ReturnType<typeof getNarrativeStateForUi>>;
  emergentArcSlug: string | null;
  emergentArcStatus: string | null;
  pendingEtaMinutes: number | null;
  oldestPendingMinutes: number | null;
  failedSignals24h: number;
  expiredSignals24h: number;
  lastTick: ReturnType<typeof readLastTickResult>;
};

export async function getNpcOpsSnapshot(): Promise<NpcOpsSnapshot> {
  const supabase = createAdminClient();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    narrative,
    emergentArc,
    { count: pendingCount },
    { data: oldestPending },
    { count: failedCount },
    { count: expiredCount },
  ] = await Promise.all([
    getNarrativeStateForUi(),
    getActiveEmergentArc(),
    supabase
      .from("narrative_signals")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("narrative_signals")
      .select("created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("narrative_signals")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed")
      .gte("created_at", since24h),
    supabase
      .from("narrative_signals")
      .select("*", { count: "exact", head: true })
      .eq("status", "expired")
      .gte("created_at", since24h),
  ]);

  const perTick = getSignalsPerTick();
  const pending = pendingCount ?? narrative.pendingSignals;
  let oldestPendingMinutes: number | null = null;
  let pendingEtaMinutes: number | null = null;

  if (oldestPending?.created_at) {
    oldestPendingMinutes = Math.floor(
      (Date.now() - new Date(oldestPending.created_at).getTime()) / 60_000
    );
    pendingEtaMinutes = Math.ceil(pending / Math.max(perTick, 1)) * 15;
  }

  return {
    generation: getNpcGenerationStatus(),
    narrative,
    emergentArcSlug: emergentArc?.slug ?? null,
    emergentArcStatus: emergentArc?.status ?? null,
    pendingEtaMinutes,
    oldestPendingMinutes,
    failedSignals24h: failedCount ?? 0,
    expiredSignals24h: expiredCount ?? 0,
    lastTick: readLastTickResult(),
  };
}
