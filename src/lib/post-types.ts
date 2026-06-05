import type { PostType } from "@/lib/supabase/types";
import {
  buildNpcPostPrompt,
  npcPostUserMessage,
  NPC_TYPE_INSTRUCTIONS,
} from "@/lib/npc/prompt";

export const POST_TYPES: PostType[] = ["message", "theory", "signal", "rumor"];

/** Libellé affiché sur PostCard (null = pas de badge). */
export const POST_TYPE_LABELS: Record<PostType, string | null> = {
  message: null,
  theory: "théorie",
  signal: "signal",
  rumor: "rumeur",
};

export function isValidPostType(value: string): value is PostType {
  return POST_TYPES.includes(value as PostType);
}

/** Tirage pondéré pour la génération NPC. */
export function pickRandomNpcPostType(): PostType {
  const r = Math.random();
  if (r < 0.5) return "message";
  if (r < 0.7) return "theory";
  if (r < 0.85) return "signal";
  return "rumor";
}

export { buildNpcPostPrompt, npcPostUserMessage, NPC_TYPE_INSTRUCTIONS };
