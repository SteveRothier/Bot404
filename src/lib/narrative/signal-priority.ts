import type { PostType, ReactionKind } from "@/lib/supabase/types";

export function priorityForPost(postType: PostType): number {
  if (postType === "theory") return 40;
  if (postType === "rumor") return 35;
  if (postType === "signal") return 25;
  return 22;
}

export function priorityForReaction(kind: ReactionKind): number {
  if (kind === "amplify") return 30;
  if (kind === "relay") return 22;
  return 10;
}

/** Priorité narrative pour amplify / flag / relay selon le type de post cible. */
export function priorityForReactionSignal(
  kind: ReactionKind,
  postType: PostType | null | undefined
): number {
  if (kind === "relay") return 18;

  if (kind === "amplify") {
    if (postType === "rumor") return 34;
    if (postType === "theory") return 32;
    return priorityForReaction("amplify");
  }

  if (kind === "flag") {
    if (postType === "theory") return 30;
    if (postType === "rumor") return 28;
    return priorityForReaction("flag");
  }

  return priorityForReaction(kind);
}

export function isStrongEmergentSignal(input: {
  kind: string;
  priority: number;
  postType?: string | null;
}): boolean {
  if (input.kind === "human_joined") return true;
  if (input.kind === "human_post") {
    return (
      input.postType === "theory" ||
      input.postType === "rumor" ||
      input.priority >= 40
    );
  }
  return input.priority >= 40;
}

export { priorityForHumanJoined } from "@/lib/narrative/welcome-human";
