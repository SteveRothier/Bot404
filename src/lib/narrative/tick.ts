import { checkOllamaStatus } from "@/lib/ollama";
import { executeBeat } from "@/lib/narrative/execute-beat";
import { generateEmergentNpcResponse } from "@/lib/narrative/generate-emergent";
import { getNextDueBeat } from "@/lib/narrative/queries";
import { expireOldSignals } from "@/lib/narrative/signals";
import type { NarrativeTickResult } from "@/lib/narrative/types";

export async function runNarrativeTick(): Promise<NarrativeTickResult> {
  const ollama = await checkOllamaStatus();
  if (!ollama.online) {
    return { handled: false, mode: "none", detail: { error: "Ollama offline" } };
  }

  await expireOldSignals();

  const dueBeat = await getNextDueBeat();
  if (dueBeat) {
    const result = await executeBeat(dueBeat);
    return {
      handled: result.ok,
      mode: "scripted_beat",
      detail: {
        beat_id: dueBeat.id,
        kind: dueBeat.kind,
        sort_order: dueBeat.sort_order,
        ...result,
      },
    };
  }

  const emergent = await generateEmergentNpcResponse();
  if (emergent.ok) {
    return {
      handled: true,
      mode: "emergent",
      detail: {
        author: emergent.author,
        post_id: emergent.postId,
        comment_id: emergent.commentId,
        signal_id: emergent.signalId,
      },
    };
  }

  return {
    handled: false,
    mode: "none",
    detail: { emergent_error: emergent.error },
  };
}
