import { isStrongEmergentSignal } from "@/lib/narrative/signal-priority";
import type { NarrativeSignal } from "@/lib/narrative/types";

function parentPostType(signal: NarrativeSignal): string | null {
  return typeof signal.payload.post_type === "string"
    ? signal.payload.post_type
    : null;
}

/** 50 % post NPC / 50 % commentaire pour signaux forts (théorie, priorité haute). */
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
    return random() < 0.5;
  }

  if (signal.kind === "human_comment") {
    if (postType === "rumor" || postType === "theory") {
      return random() < 0.25;
    }
    return false;
  }

  if (signal.kind === "reaction") {
    const reaction = signal.reaction_kind;
    if (reaction === "amplify" && postType === "rumor") {
      return random() < 0.2;
    }
    if (reaction === "flag" && postType === "theory") {
      return random() < 0.15;
    }
    return false;
  }

  return false;
}
