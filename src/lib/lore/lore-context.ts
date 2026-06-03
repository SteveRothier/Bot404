import { createAdminClient } from "@/lib/supabase/admin";
import type { Archive, WorldEvent } from "@/lib/supabase/types";

export type NpcLoreContext = {
  activeEvent: WorldEvent | null;
  latestArchive: Archive | null;
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

async function fetchLatestUnlockedArchiveAdmin(): Promise<Archive | null> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("archives")
    .select("*")
    .not("unlocked_at", "is", null)
    .lte("unlocked_at", now)
    .order("unlocked_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as Archive;
}

/** Contexte lore pour Ollama — utilisable hors requête Next (scripts, cron). */
export async function getNpcLoreContext(): Promise<NpcLoreContext> {
  const [events, latestArchive] = await Promise.all([
    fetchActiveWorldEventsAdmin(),
    fetchLatestUnlockedArchiveAdmin(),
  ]);

  return {
    activeEvent: events[0] ?? null,
    latestArchive,
  };
}

export function buildNpcLorePromptBlock(context: NpcLoreContext): string {
  const parts: string[] = [];

  if (context.activeEvent) {
    parts.push(
      `Événement mondial actif : « ${context.activeEvent.title} » — ${context.activeEvent.description}`
    );
  }

  if (context.latestArchive) {
    parts.push(
      `Archive récente débloquée : « ${context.latestArchive.title} » (thème : humanité / simulation).`
    );
  }

  if (parts.length === 0) return "";
  return `\nContexte lore du réseau (à refléter dans le ton, sans casser le personnage) :\n${parts.join("\n")}`;
}
