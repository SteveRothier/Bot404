import type { PostType, ReactionKind } from "@/lib/supabase/types";

export function priorityForPost(postType: PostType): number {
  if (postType === "theory") return 40;
  if (postType === "rumor") return 35;
  if (postType === "signal") return 25;
  return 15;
}

export function priorityForReaction(kind: ReactionKind): number {
  if (kind === "amplify") return 30;
  if (kind === "relay") return 22;
  return 10;
}

export function isStrongEmergentSignal(input: {
  kind: string;
  priority: number;
  postType?: string | null;
}): boolean {
  if (input.kind === "human_post") {
    return input.postType === "theory" || input.priority >= 40;
  }
  return input.priority >= 40;
}
