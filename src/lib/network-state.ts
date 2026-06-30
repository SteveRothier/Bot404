import type { NetworkState } from "@/lib/supabase/types";

export function computeNetworkState(input: {
  humanPercent: number;
}): NetworkState {
  if (input.humanPercent < 0.02) return "critical";
  if (input.humanPercent < 0.05) return "unstable";
  return "stable";
}
