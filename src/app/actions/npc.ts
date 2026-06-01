"use server";

import { revalidatePath } from "next/cache";
import { checkNpcCooldown, setNpcCooldown } from "@/lib/npc/cooldown";
import { generateNpcComment } from "@/lib/npc/generate-comment";
import { generateNpcPost } from "@/lib/npc/generate-post";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Connectez-vous pour utiliser la génération NPC." as const };
  }
  return { user };
}

export async function generateNpcPostAction() {
  const auth = await requireUser();
  if ("error" in auth) return { error: auth.error };

  const cooldown = await checkNpcCooldown(auth.user.id, "post");
  if (!cooldown.ok) return { error: cooldown.error };

  try {
    const result = await generateNpcPost();
    if (!result.ok) {
      return { error: result.error };
    }

    await setNpcCooldown(auth.user.id, "post");

    revalidatePath("/");
    revalidatePath("/trending");
    return {
      success: true,
      author: result.author,
      postId: result.postId,
    };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Erreur lors de la génération.";
    return { error: message };
  }
}

export async function generateNpcCommentAction() {
  const auth = await requireUser();
  if ("error" in auth) return { error: auth.error };

  const cooldown = await checkNpcCooldown(auth.user.id, "comment");
  if (!cooldown.ok) return { error: cooldown.error };

  try {
    const result = await generateNpcComment();
    if (!result.ok) {
      return { error: result.error };
    }

    await setNpcCooldown(auth.user.id, "comment");

    revalidatePath("/");
    revalidatePath(`/post/${result.postId}`);
    revalidatePath("/trending");
    return {
      success: true,
      author: result.author,
      postId: result.postId,
      commentId: result.commentId,
    };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Erreur lors de la génération.";
    return { error: message };
  }
}
