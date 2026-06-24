"use server";

import { revalidatePath } from "next/cache";
import { revalidateDataCaches } from "@/lib/queries/cache-tags";
import { processReactionFactionEffects } from "@/lib/factions/simulation";
import { runNarrativeEscalation } from "@/lib/narrative/escalation";
import { enqueueReactionSignal } from "@/lib/narrative/signals";
import { triggerNarrativeTickAfterAction } from "@/lib/narrative/trigger-tick";
import { createReactionNotification } from "@/lib/notifications";
import { maybeNpcReactionsOnPost } from "@/lib/npc/npc-reaction";
import { isReactionKind } from "@/lib/reactions";
import { maybePromoteRumorToEvent } from "@/lib/rumor-events";
import { requireAuthUser } from "@/lib/queries/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { PostType, ReactionKind } from "@/lib/supabase/types";

async function mirrorNpcReactionsOnRelay(postId: number) {
  if (Math.random() > 0.6) return;

  const supabase = createAdminClient();
  const { data: post } = await supabase
    .from("posts")
    .select("author_id, post_type, author:profiles!author_id(is_npc)")
    .eq("id", postId)
    .maybeSingle();

  if (!post) return;

  const authorRaw = post.author;
  const author = (
    Array.isArray(authorRaw) ? authorRaw[0] : authorRaw
  ) as { is_npc?: boolean } | null;

  if (author?.is_npc) return;

  await maybeNpcReactionsOnPost(postId, {
    humanAuthorId: post.author_id,
    postType: (post.post_type ?? "message") as PostType,
    minCount: 1,
    maxCount: 2,
  });
}

async function applyNarrativeReactionEffects(
  postId: number,
  userId: string,
  kind: ReactionKind
) {
  if (kind === "relay") {
    await createReactionNotification(postId, userId, "relay");
    await enqueueReactionSignal(userId, postId, kind);
    await mirrorNpcReactionsOnRelay(postId);
    triggerNarrativeTickAfterAction();
    return;
  }

  if (kind === "amplify") {
    await createReactionNotification(postId, userId, "amplify");
    await maybePromoteRumorToEvent(postId);
    await runNarrativeEscalation(postId);
  }

  await enqueueReactionSignal(userId, postId, kind);
  triggerNarrativeTickAfterAction();
}

export async function toggleReaction(postId: number, kind: string) {
  if (!isReactionKind(kind)) {
    return { error: "Réaction invalide." };
  }

  const auth = await requireAuthUser("Connectez-vous pour réagir.");
  if ("error" in auth) return auth;

  const supabase = await createClient();
  const admin = createAdminClient();
  const { user } = auth;
  const reactionKind = kind as ReactionKind;

  const { data: existing } = await supabase
    .from("post_reactions")
    .select("kind")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (existing?.kind === kind) {
    const { error } = await supabase
      .from("post_reactions")
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", postId);
    if (error) return { error: error.message };
    await processReactionFactionEffects(admin, postId, reactionKind, -1);
    revalidatePath("/");
    revalidateDataCaches();
    return { success: true, kind: null };
  }

  let factionFeedback: { factionName: string; delta: number } | null = null;

  if (existing) {
    const oldKind = existing.kind as ReactionKind;
    const { error } = await supabase
      .from("post_reactions")
      .update({ kind })
      .eq("user_id", user.id)
      .eq("post_id", postId);
    if (error) return { error: error.message };
    await processReactionFactionEffects(admin, postId, oldKind, -1);
    factionFeedback = await processReactionFactionEffects(
      admin,
      postId,
      reactionKind,
      1
    );
    await applyNarrativeReactionEffects(postId, user.id, reactionKind);
  } else {
    const { error } = await supabase.from("post_reactions").insert({
      user_id: user.id,
      post_id: postId,
      kind,
    });
    if (error) return { error: error.message };
    factionFeedback = await processReactionFactionEffects(
      admin,
      postId,
      reactionKind,
      1
    );

    await applyNarrativeReactionEffects(postId, user.id, reactionKind);
  }

  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
  revalidateDataCaches();
  return { success: true, kind, factionFeedback: factionFeedback ?? undefined };
}
