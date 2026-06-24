import { createAdminClient } from "@/lib/supabase/admin";
import type { NarrativeArc, NarrativeBeat } from "@/lib/narrative/types";

export async function getActiveScriptedArc(): Promise<NarrativeArc | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("narrative_arcs")
    .select("*")
    .eq("mode", "scripted")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as NarrativeArc | null) ?? null;
}

export async function getActiveEmergentArc(): Promise<NarrativeArc | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("narrative_arcs")
    .select("*")
    .eq("mode", "emergent")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as NarrativeArc | null) ?? null;
}

export async function getNextDueBeat(): Promise<
  (NarrativeBeat & { arc: NarrativeArc }) | null
> {
  const arc = await getActiveScriptedArc();
  if (!arc) return null;

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: beat } = await supabase
    .from("narrative_beats")
    .select("*")
    .eq("arc_id", arc.id)
    .eq("status", "pending")
    .lte("run_at", now)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!beat) return null;
  return { ...(beat as NarrativeBeat), arc };
}

export async function getBeatByArcAndOrder(
  arcId: number,
  sortOrder: number
): Promise<NarrativeBeat | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("narrative_beats")
    .select("*")
    .eq("arc_id", arcId)
    .eq("sort_order", sortOrder)
    .maybeSingle();

  return (data as NarrativeBeat | null) ?? null;
}

export async function getCompletedActOneSynopsis(): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("narrative_arcs")
    .select("synopsis, title")
    .eq("slug", "chasse-humains-acte-1")
    .eq("status", "completed")
    .maybeSingle();

  if (!data) return null;
  return `Acte 1 « ${data.title} » terminé. ${data.synopsis}`;
}

export async function isEmergentModeActive(): Promise<boolean> {
  const arc = await getActiveEmergentArc();
  if (arc !== null) return true;
  if (process.env.NODE_ENV === "development") return true;
  return false;
}

export type NarrativeUiState = {
  emergentActive: boolean;
  pendingSignals: number;
};

export async function getNarrativeStateForUi(): Promise<NarrativeUiState> {
  const supabase = createAdminClient();
  const [emergent, { count }] = await Promise.all([
    getActiveEmergentArc(),
    supabase
      .from("narrative_signals")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return {
    emergentActive: emergent !== null,
    pendingSignals: count ?? 0,
  };
}
