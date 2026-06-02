import { checkOllamaStatus } from "@/lib/ollama";
import {
  minutesUntilNextNpcRun,
  NPC_COMMENT_INTERVAL_MINUTES,
  NPC_POST_INTERVAL_MINUTES,
} from "@/lib/npc-schedule";
import { getRecentlyUnlockedArchives } from "@/lib/queries/archives";
import {
  getCachedFactions,
  getCachedNetworkStats,
  getCachedPopularHashtags,
} from "@/lib/queries/cached";
import {
  getLastNpcCommentTime,
  getLastNpcPostTime,
} from "@/lib/queries/npc-schedule";
import { getActiveWorldEvents } from "@/lib/queries/world-events";
import type { OllamaStatus } from "@/lib/ollama";
import type { Archive, WorldEvent } from "@/lib/supabase/types";

export type ShellLoreAlerts = {
  activeWorldEvent: WorldEvent | null;
  recentArchive: Archive | null;
};

export type ShellNpcSchedule = {
  lastPostAt: string | null;
  lastCommentAt: string | null;
  nextPostMinutes: number;
  nextCommentMinutes: number;
};

export async function getShellData() {
  const [
    stats,
    hashtags,
    factions,
    lastPostAt,
    lastCommentAt,
    ollama,
    activeEvents,
    recentArchives,
  ] = await Promise.all([
    getCachedNetworkStats(),
    getCachedPopularHashtags(10),
    getCachedFactions(),
    getLastNpcPostTime(),
    getLastNpcCommentTime(),
    checkOllamaStatus(),
    getActiveWorldEvents(),
    getRecentlyUnlockedArchives(168),
  ]);

  const npcSchedule: ShellNpcSchedule = {
    lastPostAt: lastPostAt?.toISOString() ?? null,
    lastCommentAt: lastCommentAt?.toISOString() ?? null,
    nextPostMinutes: minutesUntilNextNpcRun(
      lastPostAt,
      NPC_POST_INTERVAL_MINUTES
    ),
    nextCommentMinutes: minutesUntilNextNpcRun(
      lastCommentAt,
      NPC_COMMENT_INTERVAL_MINUTES
    ),
  };

  const loreAlerts: ShellLoreAlerts = {
    activeWorldEvent: activeEvents[0] ?? null,
    recentArchive: recentArchives[0] ?? null,
  };

  return {
    stats,
    hashtags: hashtags.slice(0, 5),
    factions,
    npcSchedule,
    ollama: ollama as OllamaStatus,
    loreAlerts,
  };
}
