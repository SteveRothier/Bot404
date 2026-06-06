import { extractMentionUsernames } from "@/lib/mentions";
import { maybeTriggerMentionDrama } from "@/lib/narrative/escalation";
import type { NarrativeSignalKind } from "@/lib/narrative/types";
import {
  priorityForPost,
  priorityForReaction,
} from "@/lib/narrative/signal-priority";
import type { PostType, ReactionKind } from "@/lib/supabase/types";
import { createAdminClient } from "@/lib/supabase/admin";

const SIGNAL_TTL_MS = 48 * 60 * 60 * 1000;

async function isHumanUser(userId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("is_npc")
    .eq("id", userId)
    .maybeSingle();

  return data?.is_npc === false;
}

async function enqueueSignal(input: {
  kind: NarrativeSignalKind;
  authorId: string;
  postId?: number | null;
  commentId?: number | null;
  reactionKind?: string | null;
  mentionedUsername?: string | null;
  priority: number;
  payload?: Record<string, unknown>;
}) {
  if (!(await isHumanUser(input.authorId))) return;

  const supabase = createAdminClient();
  await supabase.from("narrative_signals").insert({
    kind: input.kind,
    author_id: input.authorId,
    post_id: input.postId ?? null,
    comment_id: input.commentId ?? null,
    reaction_kind: input.reactionKind ?? null,
    mentioned_username: input.mentionedUsername ?? null,
    priority: input.priority,
    payload: input.payload ?? {},
  });
}

export async function enqueueHumanPostSignal(
  authorId: string,
  postId: number,
  content: string,
  postType: PostType
) {
  await enqueueSignal({
    kind: "human_post",
    authorId,
    postId,
    priority: priorityForPost(postType),
    payload: { content, post_type: postType },
  });

  await enqueueMentionSignals(authorId, content, postId, null);
}

export async function enqueueHumanCommentSignal(
  authorId: string,
  postId: number,
  commentId: number,
  content: string
) {
  await enqueueSignal({
    kind: "human_comment",
    authorId,
    postId,
    commentId,
    priority: 28,
    payload: { content },
  });

  await enqueueMentionSignals(authorId, content, postId, commentId);
}

export async function enqueueReactionSignal(
  authorId: string,
  postId: number,
  kind: ReactionKind
) {
  await enqueueSignal({
    kind: "reaction",
    authorId,
    postId,
    reactionKind: kind,
    priority: priorityForReaction(kind),
    payload: { reaction: kind },
  });
}

async function enqueueMentionSignals(
  authorId: string,
  content: string,
  postId: number,
  commentId: number | null
) {
  const usernames = extractMentionUsernames(content);
  if (usernames.length === 0) return;

  const supabase = createAdminClient();
  let npcMentionCount = 0;

  for (const raw of usernames) {
    const { data: npc } = await supabase
      .from("profiles")
      .select("username")
      .eq("is_npc", true)
      .ilike("username", raw)
      .maybeSingle();

    if (!npc) continue;
    npcMentionCount++;

    await enqueueSignal({
      kind: "mention",
      authorId,
      postId,
      commentId,
      mentionedUsername: npc.username,
      priority: 45,
      payload: { content, mentioned: npc.username },
    });
  }

  if (npcMentionCount >= 2 && !commentId) {
    await maybeTriggerMentionDrama(postId, npcMentionCount);
  }
}

export async function expireOldSignals() {
  const supabase = createAdminClient();
  const cutoff = new Date(Date.now() - SIGNAL_TTL_MS).toISOString();
  await supabase
    .from("narrative_signals")
    .update({ status: "expired" })
    .eq("status", "pending")
    .lt("created_at", cutoff);
}

export async function getTopPendingSignal() {
  const supabase = createAdminClient();
  await expireOldSignals();

  const { data } = await supabase
    .from("narrative_signals")
    .select("*")
    .eq("status", "pending")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data;
}
