import type { ReactionKind } from "@/lib/supabase/types";

export const REACTION_LABELS: Record<
  ReactionKind,
  { label: string; verb: string }
> = {
  relay: { label: "J'aime", verb: "aimer" },
  amplify: { label: "Amplifier", verb: "amplifier" },
  flag: { label: "Signaler", verb: "signaler" },
};

export function isReactionKind(value: string): value is ReactionKind {
  return value === "relay" || value === "amplify" || value === "flag";
}

export type ReactionCounts = Record<ReactionKind, number>;

export function applyReactionToggle(
  prevActive: ReactionKind | null,
  counts: ReactionCounts,
  kind: ReactionKind
): { active: ReactionKind | null; counts: ReactionCounts } {
  if (prevActive === kind) {
    return {
      active: null,
      counts: { ...counts, [kind]: Math.max(0, counts[kind] - 1) },
    };
  }
  const next = { ...counts, [kind]: counts[kind] + 1 };
  if (prevActive) {
    next[prevActive] = Math.max(0, next[prevActive] - 1);
  }
  return { active: kind, counts: next };
}
