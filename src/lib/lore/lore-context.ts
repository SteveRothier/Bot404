import { createAdminClient } from "@/lib/supabase/admin";
import type { WorldEvent } from "@/lib/supabase/types";

export type NpcLoreContext = {
  activeEvent: WorldEvent | null;
};

async function fetchActiveWorldEventsAdmin(): Promise<WorldEvent[]> {
  const supabase = createAdminClient();
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

/** Contexte lore pour Ollama — utilisable hors requête Next (scripts, cron). */
export async function getNpcLoreContext(): Promise<NpcLoreContext> {
  const events = await fetchActiveWorldEventsAdmin();

  return {
    activeEvent: events[0] ?? null,
  };
}

export function buildNpcLorePromptBlock(context: NpcLoreContext): string {
  if (!context.activeEvent) return "";

  return `\nContexte lore du réseau (à refléter dans le ton, sans casser le personnage) :\nÉvénement mondial actif : « ${context.activeEvent.title} » — ${context.activeEvent.description}`;
}
