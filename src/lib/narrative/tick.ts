import { checkOllamaStatus } from "@/lib/ollama";
import { generateEmergentNpcResponseBatch } from "@/lib/narrative/generate-emergent";
import {
  getAmbientFallbackChance,
  getSignalsPerTick,
} from "@/lib/narrative/tick-config";
import { expireOldSignals } from "@/lib/narrative/signals";
import { checkNarrativeEndgame } from "@/lib/narrative/endgame";
import type { NarrativeTickResult } from "@/lib/narrative/types";
import { generateNpcComment } from "@/lib/npc/generate-comment";
import { generateNpcPost } from "@/lib/npc/generate-post";
import { maybeAmbientNpcReactionsOnHumanPost } from "@/lib/npc/npc-reaction";

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

  const maxSignals = options.maxSignals ?? getSignalsPerTick();
  const batch = await generateEmergentNpcResponseBatch(maxSignals);

  if (batch.handled > 0) {
    const first = batch.results[0];
    const endgame = await checkNarrativeEndgame();
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
        endgame: endgame.triggered ? endgame : undefined,
      },
    };
  }

  if (Math.random() < getAmbientFallbackChance()) {
    await maybeAmbientNpcReactionsOnHumanPost();

    const ambient =
      Math.random() < 0.65
        ? await generateNpcComment()
        : await generateNpcPost();

    if (ambient.ok) {
      const isComment = "commentId" in ambient;
      const endgame = await checkNarrativeEndgame();
      return {
        handled: true,
        mode: "ambient",
        detail: {
          kind: isComment ? "comment" : "post",
          author: ambient.author,
          post_id: ambient.postId,
          comment_id: isComment ? ambient.commentId : undefined,
          endgame: endgame.triggered ? endgame : undefined,
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

  const endgame = await checkNarrativeEndgame();
  return {
    handled: false,
    mode: "none",
    detail: {
      emergent_error: batch.lastError,
      endgame: endgame.triggered ? endgame : undefined,
    },
  };
}
