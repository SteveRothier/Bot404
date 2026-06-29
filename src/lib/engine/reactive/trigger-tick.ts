import { runNarrativeTick } from "@/lib/engine/reactive/tick";
import { isNpcGenerationEnabled } from "@/lib/engine/shared/generation-gate";

const COOLDOWN_MS = 45_000;

let lastRunAt = 0;
let trailingTimer: ReturnType<typeof setTimeout> | null = null;

function fireTick() {
  lastRunAt = Date.now();
  void runNarrativeTick({ maxSignals: 1 }).catch(() => {});
}

/** Déclenche un tick narratif après action joueur (cooldown 45 s). */
export function triggerNarrativeTickAfterAction(): void {
  if (!isNpcGenerationEnabled()) return;

  const now = Date.now();

  if (now - lastRunAt >= COOLDOWN_MS) {
    if (trailingTimer) {
      clearTimeout(trailingTimer);
      trailingTimer = null;
    }
    fireTick();
    return;
  }

  if (trailingTimer) return;

  trailingTimer = setTimeout(() => {
    trailingTimer = null;
    fireTick();
  }, COOLDOWN_MS - (now - lastRunAt));
}
