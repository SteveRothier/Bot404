import { checkOllamaStatus } from "@/lib/ollama";
import { executeBeat } from "@/lib/narrative/execute-beat";
import { generateEmergentNpcResponseBatch } from "@/lib/narrative/generate-emergent";
import { getNextDueBeat } from "@/lib/narrative/queries";
import {
  getAmbientFallbackChance,
  getSignalsPerTick,
} from "@/lib/narrative/tick-config";
import { expireOldSignals } from "@/lib/narrative/signals";
import type { NarrativeTickResult } from "@/lib/narrative/types";
import { generateNpcComment } from "@/lib/npc/generate-comment";
import { generateNpcPost } from "@/lib/npc/generate-post";

export type RunNarrativeTickOptions = {
  /** Surcharge le nombre de signaux émergents traités (défaut: NARRATIVE_SIGNALS_PER_TICK). */
  maxSignals?: number;
};

export async function runNarrativeTick(
  options: RunNarrativeTickOptions = {}
): Promise<NarrativeTickResult> {
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

  const maxSignals = options.maxSignals ?? getSignalsPerTick();
  const batch = await generateEmergentNpcResponseBatch(maxSignals);

  if (batch.handled > 0) {
    const first = batch.results[0];
    return {
      handled: true,
      mode: "emergent",
      detail: {
        batch_count: batch.handled,
        batch: batch.results.map((r) => ({
          author: r.author,
          post_id: r.postId,
          comment_id: r.commentId,
          signal_id: r.signalId,
          response_type: r.responseType,
        })),
        author: first.author,
        post_id: first.postId,
        comment_id: first.commentId,
        signal_id: first.signalId,
      },
    };
  }

  if (Math.random() < getAmbientFallbackChance()) {
    const ambient =
      Math.random() < 0.55
        ? await generateNpcPost()
        : await generateNpcComment();

    if (ambient.ok) {
      const isComment = "commentId" in ambient;
      return {
        handled: true,
        mode: "ambient",
        detail: {
          kind: isComment ? "comment" : "post",
          author: ambient.author,
          post_id: ambient.postId,
          comment_id: isComment ? ambient.commentId : undefined,
        },
      };
    }

    return {
      handled: false,
      mode: "none",
      detail: {
        emergent_error: batch.lastError,
        ambient_error: ambient.error,
      },
    };
  }

  return {
    handled: false,
    mode: "none",
    detail: { emergent_error: batch.lastError },
  };
}
