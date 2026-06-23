"use server";

import { revalidatePath } from "next/cache";
import { revalidateDataCaches } from "@/lib/queries/cache-tags";
import { processReactionFactionEffects } from "@/lib/factions/simulation";
import { runNarrativeEscalation } from "@/lib/narrative/escalation";
import { enqueueReactionSignal } from "@/lib/narrative/signals";
import { createReactionNotification } from "@/lib/notifications";
import { isReactionKind } from "@/lib/reactions";
import { maybePromoteRumorToEvent } from "@/lib/rumor-events";
import { requireAuthUser } from "@/lib/queries/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ReactionKind } from "@/lib/supabase/types";

async function applyNarrativeReactionEffects(
  postId: number,
  userId: string,
  kind: ReactionKind
) {
  if (kind === "relay") return;

  if (kind === "amplify") {
    await createReactionNotification(postId, userId, "amplify");
    await maybePromoteRumorToEvent(postId);
    await runNarrativeEscalation(postId);
  }

  await enqueueReactionSignal(userId, postId, kind);
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

  if (existing) {
    const oldKind = existing.kind as ReactionKind;
    const { error } = await supabase
      .from("post_reactions")
      .update({ kind })
      .eq("user_id", user.id)
      .eq("post_id", postId);
    if (error) return { error: error.message };
    await processReactionFactionEffects(admin, postId, oldKind, -1);
    await processReactionFactionEffects(admin, postId, reactionKind, 1);
    await applyNarrativeReactionEffects(postId, user.id, reactionKind);
    if (reactionKind === "relay") {
      await createReactionNotification(postId, user.id, "relay");
    }
  } else {
    const { error } = await supabase.from("post_reactions").insert({
      user_id: user.id,
      post_id: postId,
      kind,
    });
    if (error) return { error: error.message };
    await processReactionFactionEffects(admin, postId, reactionKind, 1);

    if (reactionKind === "relay") {
      await createReactionNotification(postId, user.id, "relay");
    } else {
      await applyNarrativeReactionEffects(postId, user.id, reactionKind);
    }
  }

  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
  revalidateDataCaches();
  return { success: true, kind };
}
