"use server";

import { revalidatePath } from "next/cache";
import { revalidateDataCaches } from "@/lib/queries/shell";
import { requireAuthUser } from "@/lib/queries/shell";
import { checkNpcCooldown, setNpcCooldown } from "@/lib/engine/shared/cooldown";
import {
  clampNpcCommentBatchCount,
  generateNpcComment,
  generateNpcCommentsBatch,
} from "@/lib/engine/ambient/generate-comment";
import {
  clampNpcPostBatchCount,
  generateNpcPost,
  generateNpcPostsBatch,
} from "@/lib/engine/ambient/generate-post";
import { getNpcMediaStatus } from "@/lib/engine/content/media";
import {
  NPC_GENERATION_DISABLED_ERROR,
  isNpcGenerationEnabled,
} from "@/lib/engine/shared/generation-gate";
import { runNarrativeTick } from "@/lib/engine/reactive/tick";

export async function getNpcMediaStatusAction() {
  return getNpcMediaStatus();
}

function tickPostFromDetail(detail: Record<string, unknown> | undefined): {
  postId?: number;
  commentId?: number;
  author?: string;
} | null {
  if (!detail) return null;

  const batch = detail.batch as
    | Array<{ post_id?: number; comment_id?: number; author?: string }>
    | undefined;
  if (batch?.[0]) {
    const b = batch[0];
    return {
      postId: b.post_id,
      commentId: b.comment_id ?? undefined,
      author: b.author,
    };
  }

  const postId = detail.post_id as number | undefined;
  const commentId = detail.comment_id as number | undefined;
  const author = detail.author as string | undefined;
  if (postId) return { postId, commentId, author };
  return null;
}

async function revalidateAfterNpcAction(postId?: number) {
  revalidatePath("/");
  if (postId) revalidatePath(`/post/${postId}`);
  revalidatePath("/trending");
  revalidateDataCaches();
}

type BatchActionResult = {
  success: true;
  generated: number;
  author: string;
  postId: number;
  commentId?: number;
  pollVotes?: number;
};

export async function generateNpcPostAction(count = 1) {
  const auth = await requireAuthUser(
    "Connectez-vous pour utiliser la génération NPC."
  );
  if ("error" in auth) return { error: auth.error };

  if (!isNpcGenerationEnabled()) {
    return { error: NPC_GENERATION_DISABLED_ERROR };
  }

  const cooldown = await checkNpcCooldown(auth.user.id, "post");
  if (!cooldown.ok) return { error: cooldown.error };

  const batchSize = clampNpcPostBatchCount(count);

  try {
    if (batchSize === 1) {
      const tick = await runNarrativeTick();
      if (tick.handled) {
        if (tick.mode === "emergent" || tick.mode === "ambient") {
          const extracted = tickPostFromDetail(
            tick.detail as Record<string, unknown> | undefined
          );
          if (extracted?.postId) {
            await setNpcCooldown(auth.user.id, "post");
            await revalidateAfterNpcAction();
            return {
              success: true,
              generated: 1,
              author: extracted.author ?? "NPC",
              postId: extracted.postId,
            } satisfies BatchActionResult;
          }
        }
      }
    }

    const results = await generateNpcPostsBatch(batchSize);
    const successes = results.filter((r) => r.ok);
    if (successes.length === 0) {
      const firstError = results.find((r) => !r.ok);
      return { error: firstError?.error ?? "Échec de la génération." };
    }

    await setNpcCooldown(auth.user.id, "post");
    await revalidateAfterNpcAction(successes[0].postId);
    return {
      success: true,
      generated: successes.length,
      author: successes[0].author,
      postId: successes[0].postId,
    } satisfies BatchActionResult;
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Erreur lors de la génération.";
    return { error: message };
  }
}

export async function generateNpcCommentAction(count = 1) {
  const auth = await requireAuthUser(
    "Connectez-vous pour utiliser la génération NPC."
  );
  if ("error" in auth) return { error: auth.error };

  if (!isNpcGenerationEnabled()) {
    return { error: NPC_GENERATION_DISABLED_ERROR };
  }

  const cooldown = await checkNpcCooldown(auth.user.id, "comment");
  if (!cooldown.ok) return { error: cooldown.error };

  const batchSize = clampNpcCommentBatchCount(count);

  try {
    if (batchSize === 1) {
      const tick = await runNarrativeTick();
      if (tick.handled) {
        const extracted = tickPostFromDetail(
          tick.detail as Record<string, unknown> | undefined
        );
        const commentId = extracted?.commentId;
        const postId = extracted?.postId;
        const author = extracted?.author ?? "NPC";

        if (commentId && postId) {
          await setNpcCooldown(auth.user.id, "comment");
          await revalidateAfterNpcAction(postId);
          return {
            success: true,
            generated: 1,
            author,
            postId,
            commentId,
            pollVotes: 0,
          } satisfies BatchActionResult;
        }
      }
    }

    const results =
      batchSize === 1
        ? [await generateNpcComment()]
        : await generateNpcCommentsBatch(batchSize);

    const successes = results.filter((r) => r.ok);
    if (successes.length === 0) {
      const firstError = results.find((r) => !r.ok);
      return { error: firstError?.error ?? "Échec de la génération." };
    }

    const pollVotes = successes.filter((r) => r.ok && r.pollVote).length;

    await setNpcCooldown(auth.user.id, "comment");
    await revalidateAfterNpcAction(successes[0].postId);
    return {
      success: true,
      generated: successes.length,
      author: successes[0].author,
      postId: successes[0].postId,
      commentId: successes[0].commentId,
      pollVotes,
    } satisfies BatchActionResult;
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Erreur lors de la génération.";
    return { error: message };
  }
}
