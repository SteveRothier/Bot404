"use server";

import { revalidatePath } from "next/cache";
import { checkNpcCooldown, setNpcCooldown } from "@/lib/npc/cooldown";
import { generateNpcComment } from "@/lib/npc/generate-comment";
import { generateNpcPost } from "@/lib/npc/generate-post";
import { runNarrativeTick } from "@/lib/narrative/tick";
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
    const tick = await runNarrativeTick();
    if (tick.handled && tick.mode === "scripted_beat") {
      const inner = (tick.detail as { result?: { post_id?: number; author?: string } })
        ?.result;
      if (inner?.post_id) {
        await setNpcCooldown(auth.user.id, "post");
        revalidatePath("/");
        revalidatePath("/trending");
        return {
          success: true,
          author: inner.author ?? "NPC",
          postId: inner.post_id,
        };
      }
    }

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
    const tick = await runNarrativeTick();
    if (tick.handled) {
      const inner = (tick.detail as {
        result?: { comment_id?: number; post_id?: number; author?: string };
        comment_id?: number;
        post_id?: number;
        author?: string;
      })?.result;
      const commentId = inner?.comment_id ?? (tick.detail as { comment_id?: number })?.comment_id;
      const postId = inner?.post_id ?? (tick.detail as { post_id?: number })?.post_id;
      const author =
        inner?.author ?? (tick.detail as { author?: string })?.author ?? "NPC";

      if (commentId && postId) {
        await setNpcCooldown(auth.user.id, "comment");
        revalidatePath("/");
        revalidatePath(`/post/${postId}`);
        revalidatePath("/trending");
        return {
          success: true,
          author,
          postId,
          commentId,
        };
      }
    }

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
