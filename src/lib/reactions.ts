import type { ReactionKind } from "@/lib/supabase/types";

export const REACTION_LABELS: Record<
  ReactionKind,
  { label: string; verb: string }
> = {
  relay: { label: "Relayer", verb: "relayer" },
  amplify: { label: "Amplifier", verb: "amplifier" },
  flag: { label: "Signaler", verb: "signaler" },
};

export function isReactionKind(value: string): value is ReactionKind {
  return value === "relay" || value === "amplify" || value === "flag";
}
