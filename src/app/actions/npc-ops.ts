"use server";

import { revalidatePath } from "next/cache";
import { runNarrativeTick } from "@/lib/engine/reactive/tick";
import {
  NPC_GENERATION_DISABLED_ERROR,
  isNpcGenerationEnabled,
} from "@/lib/engine/shared/generation-gate";
import { getNpcOpsSnapshot } from "@/lib/queries/shell/narrative-ops";
import { requireAuthUser } from "@/lib/queries/shell";
import { revalidateDataCaches } from "@/lib/queries/shell";

export async function getNpcOpsSnapshotAction() {
  const auth = await requireAuthUser("Connectez-vous pour voir les ops NPC.");
  if ("error" in auth) return { error: auth.error };
  return { snapshot: await getNpcOpsSnapshot() };
}

export async function runManualTickAction() {
  const auth = await requireAuthUser("Connectez-vous pour lancer un tick.");
  if ("error" in auth) return { error: auth.error };

  if (!isNpcGenerationEnabled()) {
    return { error: NPC_GENERATION_DISABLED_ERROR };
  }

  try {
    const result = await runNarrativeTick({ maxSignals: 2 });
    revalidatePath("/");
    revalidateDataCaches();
    return { success: true, result };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Échec du tick.";
    return { error: message };
  }
}
