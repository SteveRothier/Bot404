import { processCommentFactionEffects } from "@/lib/factions/simulation";
import { buildEmergentPrompt } from "@/lib/narrative/build-prompt";
import { getEmergentArcSynopsis } from "@/lib/narrative/execute-beat";
import { getActiveEmergentArc } from "@/lib/narrative/queries";
import type { NarrativeSignal } from "@/lib/narrative/types";
import { ollamaChat } from "@/lib/npc/ollama";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/supabase/types";

const PURBOT_USERNAMES = ["ConspiracyBot", "Omega", "TrollMaster", "Orion"];
const HUMANIST_USERNAMES = ["ByteDreamer", "Nova", "Philosoraptor", "FakeInfluencer"];

async function loadSignalContext(signal: NarrativeSignal) {
  const supabase = createAdminClient();

  const { data: author } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", signal.author_id)
    .maybeSingle();

  let content = "";
  let postId = signal.post_id;
  let actionLabel = "interagir sur le réseau";

  if (signal.kind === "human_post" && signal.post_id) {
    const { data: post } = await supabase
      .from("posts")
      .select("content, post_type")
      .eq("id", signal.post_id)
      .maybeSingle();
    content = post?.content ?? "";
    actionLabel = `publier un ${post?.post_type ?? "post"}`;
  } else if (signal.kind === "human_comment" && signal.comment_id) {
    const { data: comment } = await supabase
      .from("comments")
      .select("content, post_id")
      .eq("id", signal.comment_id)
      .maybeSingle();
    content = comment?.content ?? "";
    postId = comment?.post_id ?? postId;
    actionLabel = "commenter";
  } else if (signal.kind === "reaction" && signal.post_id) {
    const { data: post } = await supabase
      .from("posts")
      .select("content, post_type")
      .eq("id", signal.post_id)
      .maybeSingle();
    content = post?.content ?? "";
    actionLabel = `${signal.reaction_kind ?? "réagir à"} un post (${post?.post_type ?? "message"})`;
  } else if (signal.kind === "dossier_entry") {
    if (signal.investigation_entry_id) {
      const { data: entry } = await supabase
        .from("investigation_entries")
        .select("post_id, content")
        .eq("id", signal.investigation_entry_id)
        .maybeSingle();
      if (entry?.post_id) postId = entry.post_id;
      if (entry?.content) content = entry.content;
    }
    if (!content) {
      content =
        typeof signal.payload.content === "string"
          ? signal.payload.content
          : "ajouter une preuve à un dossier";
    }
    if (!postId) {
      const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { data: recentPost } = await supabase
        .from("posts")
        .select("id")
        .eq("author_id", signal.author_id)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      postId = recentPost?.id ?? postId;
    }
    actionLabel = "ajouter une preuve à un dossier";
  } else if (signal.kind === "mention") {
    content =
      typeof signal.payload.content === "string" ? signal.payload.content : "";
    actionLabel = `mentionner @${signal.mentioned_username ?? "NPC"}`;
  }

  return {
    humanUsername: author?.username ?? "humain",
    content,
    postId,
    actionLabel,
  };
}

async function pickResponderNpc(
  signal: NarrativeSignal
): Promise<Profile | null> {
  const supabase = createAdminClient();

  if (signal.mentioned_username) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", signal.mentioned_username)
      .eq("is_npc", true)
      .maybeSingle();
    if (data) return data as Profile;
  }

  const postType =
    typeof signal.payload.post_type === "string"
      ? signal.payload.post_type
      : null;

  const preferPurbot =
    postType === "theory" ||
    signal.kind === "dossier_entry" ||
    signal.reaction_kind === "flag";

  const pool = preferPurbot ? PURBOT_USERNAMES : HUMANIST_USERNAMES;
  const pick = pool[Math.floor(Math.random() * pool.length)];

  const { data: npc } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", pick)
    .eq("is_npc", true)
    .maybeSingle();

  if (npc) return npc as Profile;

  const { data: fallback } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_npc", true)
    .limit(1)
    .maybeSingle();

  return (fallback as Profile | null) ?? null;
}

async function buildThreadSnippet(postId: number | null): Promise<string> {
  if (!postId) return "";

  const supabase = createAdminClient();
  const { data: comments } = await supabase
    .from("comments")
    .select("content, author:profiles!author_id(username)")
    .eq("post_id", postId)
    .order("created_at", { ascending: false })
    .limit(3);

  if (!comments?.length) return "";

  return comments
    .reverse()
    .map((c) => {
      const author = c.author as { username?: string } | null;
      return `@${author?.username ?? "?"}: ${c.content}`;
    })
    .join("\n");
}

export async function generateEmergentNpcResponse(): Promise<
  | { ok: true; author: string; postId: number; commentId: number; signalId: number }
  | { ok: false; error: string }
> {
  const emergentArc = await getActiveEmergentArc();
  if (!emergentArc) {
    return { ok: false, error: "Mode émergent inactif." };
  }

  const supabase = createAdminClient();
  const { data: signal } = await supabase
    .from("narrative_signals")
    .select("*")
    .eq("status", "pending")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!signal) {
    return { ok: false, error: "Aucun signal en attente." };
  }

  const typedSignal = signal as NarrativeSignal;
  const ctx = await loadSignalContext(typedSignal);
  if (!ctx.postId) {
    await supabase
      .from("narrative_signals")
      .update({ status: "expired" })
      .eq("id", typedSignal.id);
    return { ok: false, error: "Signal sans post cible." };
  }

  const targetPostId = ctx.postId;

  const npc = await pickResponderNpc(typedSignal);
  if (!npc) return { ok: false, error: "Aucun NPC disponible." };

  const threadSnippet = await buildThreadSnippet(targetPostId);
  const synopsis = await getEmergentArcSynopsis();

  const { system, user } = await buildEmergentPrompt(npc, {
    humanUsername: ctx.humanUsername,
    actionLabel: ctx.actionLabel,
    content: ctx.content,
    threadSnippet,
    emergentSynopsis: synopsis,
  });

  const content = await ollamaChat(system, user, 300);
  if (!content) {
    return { ok: false, error: "Échec génération Ollama." };
  }

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({
      post_id: targetPostId,
      author_id: npc.id,
      content: content.slice(0, 300),
      narrative_signal_id: typedSignal.id,
    })
    .select("id")
    .single();

  if (error || !comment) {
    return { ok: false, error: error?.message ?? "Insert comment failed" };
  }

  await supabase
    .from("narrative_signals")
    .update({
      status: "handled",
      handled_at: new Date().toISOString(),
      result: {
        comment_id: comment.id,
        author: npc.username,
        post_id: targetPostId,
      },
    })
    .eq("id", typedSignal.id);

  await supabase
    .from("profiles")
    .update({ popularity_score: (npc.popularity_score ?? 0) + 1 })
    .eq("id", npc.id);

  await processCommentFactionEffects(supabase, targetPostId, npc.id, content);

  return {
    ok: true,
    author: npc.username,
    postId: targetPostId,
    commentId: comment.id,
    signalId: typedSignal.id,
  };
}
