import { isStrongEmergentSignal } from "@/lib/narrative/signal-priority";
import type { NarrativeSignal } from "@/lib/narrative/types";

/** 50 % post NPC / 50 % commentaire pour signaux forts (théorie, priorité haute). */
export function shouldEmergentNpcPost(
  signal: NarrativeSignal,
  random = Math.random
): boolean {
  if (signal.kind !== "human_post") return false;

  const postType =
    typeof signal.payload.post_type === "string"
      ? signal.payload.post_type
      : null;

  if (
    !isStrongEmergentSignal({
      kind: signal.kind,
      priority: signal.priority,
      postType,
    })
  ) {
    return false;
  }

  return random() < 0.5;
}
