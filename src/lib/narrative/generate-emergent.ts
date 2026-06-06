import {
  processCommentFactionEffects,
  processPostFactionEffects,
} from "@/lib/factions/simulation";
import {
  buildEmergentPostPrompt,
  buildEmergentPrompt,
} from "@/lib/narrative/build-prompt";
import { shouldEmergentNpcPost } from "@/lib/narrative/emergent-response-mode";
import { getEmergentArcSynopsis } from "@/lib/narrative/execute-beat";
import { getActiveEmergentArc } from "@/lib/narrative/queries";
import type { NarrativeSignal } from "@/lib/narrative/types";
import { pickNpcForSignal } from "@/lib/npc/cast";
import { resolveNpcPostMedia, shouldAttachMediaToNpcPost } from "@/lib/npc/media";
import { ollamaChat } from "@/lib/npc/ollama";
import { getRecentNpcAuthorIdsOnPost } from "@/lib/npc/recent-repliers";
import { loadAllNpcs } from "@/lib/npc/select-npc";
import { buildRichThreadSnippet } from "@/lib/npc/thread-context";
import { validateNpcPostContent } from "@/lib/npc/validate-content";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PostType, Profile } from "@/lib/supabase/types";

export type EmergentResponseSuccess = {
  ok: true;
  author: string;
  postId: number;
  commentId: number | null;
  signalId: number;
  responseType: "comment" | "post";
};

export type EmergentResponseResult =
  | EmergentResponseSuccess
  | { ok: false; error: string };

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
  signal: NarrativeSignal,
  targetPostId: number,
  humanContent: string
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

  const excludeIds = await getRecentNpcAuthorIdsOnPost(targetPostId);
  const npcs = await loadAllNpcs();
  return pickNpcForSignal(npcs, {
    signal,
    humanContent,
    excludeNpcIds: excludeIds,
  });
}

export async function processEmergentSignal(
  typedSignal: NarrativeSignal
): Promise<EmergentResponseResult> {
  const supabase = createAdminClient();
  const ctx = await loadSignalContext(typedSignal);

  if (!ctx.postId) {
    await supabase
      .from("narrative_signals")
      .update({ status: "expired" })
      .eq("id", typedSignal.id);
    return { ok: false, error: "Signal sans post cible." };
  }

  const targetPostId = ctx.postId;
  const npc = await pickResponderNpc(typedSignal, targetPostId, ctx.content);
  if (!npc) return { ok: false, error: "Aucun NPC disponible." };

  const threadSnippet = await buildRichThreadSnippet(targetPostId);
  const synopsis = await getEmergentArcSynopsis();
  const respondWithPost = shouldEmergentNpcPost(typedSignal);

  if (respondWithPost) {
    const postType: PostType =
      typeof typedSignal.payload.post_type === "string" &&
      typedSignal.payload.post_type === "rumor"
        ? "rumor"
        : "theory";

    const { system, user } = await buildEmergentPostPrompt(npc, {
      humanUsername: ctx.humanUsername,
      actionLabel: ctx.actionLabel,
      content: ctx.content,
      threadSnippet,
      emergentSynopsis: synopsis,
      postType: postType === "rumor" ? "rumor" : "theory",
    });

    const raw = await ollamaChat(system, user, 400, "default");
    const content = raw
      ? validateNpcPostContent(raw, postType, ctx.content)
      : null;
    if (!content) {
      return { ok: false, error: "Échec génération Ollama." };
    }

    const media = shouldAttachMediaToNpcPost(npc, postType)
      ? await resolveNpcPostMedia(npc, content, postType)
      : null;

    const { data: newPost, error: postError } = await supabase
      .from("posts")
      .insert({
        author_id: npc.id,
        content: content.slice(0, 500),
        post_type: postType,
        narrative_signal_id: typedSignal.id,
        likes_count: Math.floor(Math.random() * 80) + 10,
        media_url: media?.media_url ?? null,
        media_type: media?.media_type ?? null,
      })
      .select("id")
      .single();

    if (postError || !newPost) {
      return { ok: false, error: postError?.message ?? "Insert post failed" };
    }

    await supabase
      .from("narrative_signals")
      .update({
        status: "handled",
        handled_at: new Date().toISOString(),
        result: {
          post_id: newPost.id,
          response_type: "post",
          author: npc.username,
          trigger_post_id: targetPostId,
          npc_id: npc.id,
        },
      })
      .eq("id", typedSignal.id);

    await supabase
      .from("profiles")
      .update({ popularity_score: (npc.popularity_score ?? 0) + 2 })
      .eq("id", npc.id);

    await processPostFactionEffects(supabase, newPost.id);

    return {
      ok: true,
      author: npc.username,
      postId: newPost.id,
      commentId: null,
      signalId: typedSignal.id,
      responseType: "post",
    };
  }

  const { system, user } = await buildEmergentPrompt(npc, {
    humanUsername: ctx.humanUsername,
    actionLabel: ctx.actionLabel,
    content: ctx.content,
    threadSnippet,
    emergentSynopsis: synopsis,
  });

  const rawComment = await ollamaChat(system, user, 300, "comment");
  const commentContent = rawComment
    ? validateNpcPostContent(rawComment, "message", ctx.content)
    : null;
  if (!commentContent) {
    return { ok: false, error: "Échec génération Ollama." };
  }

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({
      post_id: targetPostId,
      author_id: npc.id,
      content: commentContent.slice(0, 300),
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
        response_type: "comment",
        author: npc.username,
        post_id: targetPostId,
        trigger_post_id: targetPostId,
        npc_id: npc.id,
      },
    })
    .eq("id", typedSignal.id);

  await supabase
    .from("profiles")
    .update({ popularity_score: (npc.popularity_score ?? 0) + 1 })
    .eq("id", npc.id);

  await processCommentFactionEffects(
    supabase,
    targetPostId,
    npc.id,
    commentContent
  );

  return {
    ok: true,
    author: npc.username,
    postId: targetPostId,
    commentId: comment.id,
    signalId: typedSignal.id,
    responseType: "comment",
  };
}

export async function generateEmergentNpcResponse(): Promise<EmergentResponseResult> {
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

  return processEmergentSignal(signal as NarrativeSignal);
}

export async function generateEmergentNpcResponseBatch(
  maxCount: number
): Promise<{
  handled: number;
  results: EmergentResponseSuccess[];
  lastError: string | null;
}> {
  const emergentArc = await getActiveEmergentArc();
  if (!emergentArc) {
    return { handled: 0, results: [], lastError: "Mode émergent inactif." };
  }

  const results: EmergentResponseSuccess[] = [];
  let lastError: string | null = null;

  for (let i = 0; i < maxCount; i++) {
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
      lastError = "Aucun signal en attente.";
      break;
    }

    const outcome = await processEmergentSignal(signal as NarrativeSignal);
    if (!outcome.ok) {
      lastError = outcome.error;
      if (
        outcome.error === "Aucun signal en attente." ||
        outcome.error === "Signal sans post cible."
      ) {
        break;
      }
      continue;
    }
    results.push(outcome);
  }

  return { handled: results.length, results, lastError };
}
