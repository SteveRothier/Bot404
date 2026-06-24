"use server";

import { runNarrativeTick } from "@/lib/narrative/tick";
import { getPendingSignals } from "@/lib/narrative/signals";
import { getNarrativeStateForUi } from "@/lib/narrative/queries";
import { isNarrativeAdminEnabled } from "@/lib/narrative/admin-config";

export async function forceNarrativeTickAction() {
  if (!isNarrativeAdminEnabled()) {
    return { error: "Contrôles narratifs désactivés." };
  }

  try {
    const result = await runNarrativeTick();
    return { ok: true as const, result };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Tick échoué";
    return { error: message };
  }
}

export async function getNarrativeOpsSnapshot() {
  if (!isNarrativeAdminEnabled()) return null;

  const [state, signals] = await Promise.all([
    getNarrativeStateForUi(),
    getPendingSignals(8),
  ]);

  return { state, signals };
}
