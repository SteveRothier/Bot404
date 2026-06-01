"use server";

import { revalidatePath } from "next/cache";
import { generateNpcPost } from "@/lib/npc/generate-post";
import { createClient } from "@/lib/supabase/server";

export async function generateNpcPostAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Connectez-vous pour générer un post NPC." };
  }

  try {
    const result = await generateNpcPost();
    if (!result.ok) {
      return { error: result.error };
    }

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
