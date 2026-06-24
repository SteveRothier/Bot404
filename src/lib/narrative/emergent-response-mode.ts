import { isStrongEmergentSignal } from "@/lib/narrative/signal-priority";
import type { NarrativeSignal } from "@/lib/narrative/types";

function parentPostType(signal: NarrativeSignal): string | null {
  return typeof signal.payload.post_type === "string"
    ? signal.payload.post_type
    : null;
}

/** Probabilité de post NPC vs commentaire pour signaux émergents. */
export function shouldEmergentNpcPost(
  signal: NarrativeSignal,
  random = Math.random
): boolean {
  const postType = parentPostType(signal);

  if (signal.kind === "human_post") {
    if (
      !isStrongEmergentSignal({
        kind: signal.kind,
        priority: signal.priority,
        postType,
      })
    ) {
      return false;
    }
    return random() < 0.65;
  }

  if (signal.kind === "human_comment") {
    if (postType === "rumor" || postType === "theory") {
      return random() < 0.4;
    }
    if (postType === "message") {
      return random() < 0.2;
    }
    return false;
  }

  if (signal.kind === "reaction") {
    const reaction = signal.reaction_kind;
    if (reaction === "amplify" && postType === "rumor") {
      return random() < 0.35;
    }
    if (reaction === "flag" && postType === "theory") {
      return random() < 0.3;
    }
    return false;
  }

  return false;
}
