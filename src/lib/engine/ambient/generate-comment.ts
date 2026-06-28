import { contentHasHuntKeywords } from "@/lib/engine/shared/hunt-keywords";
import {
  getTrendingHashtagsForNpc,
  trendingPromptBlock,
} from "@/lib/engine/shared/trending";
import type { NarrativeSignal } from "@/lib/engine/shared/types";
import {
  getWelcomeFocusHuman,
  welcomeAmbientPromptBlock,
} from "@/lib/engine/reactive/welcome-human";
import { checkOllamaStatus } from "@/lib/ollama";
import { pickNpcForSignal } from "@/lib/engine/casting/cast";
import { maybeNpcReactionsOnPost } from "@/lib/engine/casting/npc-reaction";
import { buildRichThreadSnippet } from "@/lib/engine/casting/thread-context";
import {
  buildNpcHistoryBlock,
  fetchRecentNpcPostContents,
} from "@/lib/engine/ambient/npc-history";
import { ollamaChat } from "@/lib/engine/content/ollama";
import { npcBase, npcExamplePostsBlock } from "@/lib/engine/content/prompt";
import { validateNpcCommentContent } from "@/lib/engine/content/validate-content";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PostType, Profile } from "@/lib/supabase/types";

export type GenerateNpcCommentResult =
  | { ok: true; author: string; postId: number; commentId: number }
  | { ok: false; error: string };

type CommentTarget = {
  id: number;
  content: string;
  author_id: string;
  post_type: PostType;
  comment_count: number;
};

async function fetchCommentCounts(
  postIds: number[]
): Promise<Map<number, number>> {
  if (postIds.length === 0) return new Map();

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("comments")
    .select("post_id")
    .in("post_id", postIds);

  const counts = new Map<number, number>();
  for (const row of data ?? []) {
    counts.set(row.post_id, (counts.get(row.post_id) ?? 0) + 1);
  }
  return counts;
}

async function pickPostToComment(
  excludePostIds: Set<number> = new Set()
): Promise<CommentTarget | null> {
  const supabase = createAdminClient();
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, content, author_id, post_type, author:profiles!author_id(is_npc)")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(60);

  if (!posts?.length) return null;

  const eligible = posts.filter((p) => !excludePostIds.has(p.id));
  if (!eligible.length) return null;

  const counts = await fetchCommentCounts(eligible.map((p) => p.id));

  const scored = eligible.map((p) => {
    const commentCount = counts.get(p.id) ?? 0;
    const author = p.author as { is_npc?: boolean } | null;
    const isHuman = author?.is_npc === false;
    const weight = 1 / (1 + commentCount) + (isHuman ? 0.35 : 0.15);
    return {
      id: p.id,
      content: p.content,
      author_id: p.author_id,
      post_type: (p.post_type ?? "message") as PostType,
      comment_count: commentCount,
      weight,
    };
  });

  const total = scored.reduce((sum, row) => sum + row.weight, 0);
  let r = Math.random() * total;

  for (const row of scored) {
    r -= row.weight;
    if (r <= 0) {
      return {
        id: row.id,
        content: row.content,
        author_id: row.author_id,
        post_type: row.post_type,
        comment_count: row.comment_count,
      };
    }
  }

  const fallback = scored[0];
  return fallback
    ? {
        id: fallback.id,
        content: fallback.content,
        author_id: fallback.author_id,
        post_type: fallback.post_type,
        comment_count: fallback.comment_count,
      }
    : null;
}

async function tryGenerateCommentForPost(
  post: CommentTarget,
  excludePostIds: Set<number>
): Promise<
  | { ok: true; npc: Profile; content: string }
  | { ok: false; error: string; retryPost?: boolean }
> {
  const supabase = createAdminClient();

  const { data: npcs } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_npc", true);

  if (!npcs?.length) {
    return { ok: false, error: "Aucun NPC trouvé." };
  }

  const commenters = (npcs as Profile[]).filter((n) => n.id !== post.author_id);
  if (!commenters.length) {
    return { ok: false, error: "Aucun NPC disponible pour commenter." };
  }

  const castSignal: NarrativeSignal = {
    id: 0,
    kind: "human_post",
    author_id: post.author_id,
    post_id: post.id,
    comment_id: null,
    reaction_kind: null,
    mentioned_username: null,
    priority: 30,
    status: "pending",
    payload: { content: post.content },
    result: {},
    created_at: new Date().toISOString(),
    handled_at: null,
  };

  const npc =
    pickNpcForSignal(commenters, {
      signal: castSignal,
      humanContent: post.content,
      excludeNpcIds: new Set([post.author_id]),
      huntContent: contentHasHuntKeywords(post.content),
    }) ?? commenters[Math.floor(Math.random() * commenters.length)];

  const [historyBlock, threadBlock, recentPosts, welcomeFocus, trends] =
    await Promise.all([
      buildNpcHistoryBlock(npc.id),
      buildRichThreadSnippet(post.id),
      fetchRecentNpcPostContents(npc.id),
      getWelcomeFocusHuman(),
      getTrendingHashtagsForNpc(5),
    ]);

  const welcomeBlock =
    welcomeFocus && Math.random() < 0.35
      ? welcomeAmbientPromptBlock(welcomeFocus.username)
      : "";

  const trendBlock =
    Math.random() < 0.45 ? trendingPromptBlock(trends, false) : "";

  const system = `${npcBase(npc)}${npcExamplePostsBlock(npc)}${historyBlock}${welcomeBlock}${trendBlock}

Fil de discussion :
${threadBlock}

Réponds en commentaire (max 200 caractères). Ton conversationnel — une phrase dans le fil. Français.`;
  const user = `Post original: "${post.content}"\nÉcris une réponse courte et originale.`;

  for (let attempt = 0; attempt < 3; attempt++) {
    const raw = await ollamaChat(system, user, 300, "comment");
    const content = raw
      ? validateNpcCommentContent(raw, post.content, recentPosts)
      : null;
    if (content) return { ok: true, npc, content };
  }

  excludePostIds.add(post.id);
  return {
    ok: false,
    error: "Contenu filtré après 3 tentatives.",
    retryPost: true,
  };
}

async function generateSingleNpcComment(
  excludePostIds: Set<number>
): Promise<GenerateNpcCommentResult> {
  const ollama = await checkOllamaStatus();
  if (!ollama.online) {
    return {
      ok: false,
      error: "Ollama est hors ligne. Lancez ollama serve et réessayez.",
    };
  }

  const supabase = createAdminClient();

  for (let postAttempt = 0; postAttempt < 3; postAttempt++) {
    const post = await pickPostToComment(excludePostIds);
    if (!post) {
      return { ok: false, error: "Aucun post récent pour commenter." };
    }

    const draft = await tryGenerateCommentForPost(post, excludePostIds);
    if (!draft.ok) {
      if (draft.retryPost) continue;
      return { ok: false, error: draft.error };
    }

    const { npc, content } = draft;

    const { data: comment, error: insertError } = await supabase
      .from("comments")
      .insert({
        post_id: post.id,
        author_id: npc.id,
        content,
      })
      .select("id")
      .single();

    if (insertError || !comment) {
      return {
        ok: false,
        error: insertError?.message ?? "Impossible d'enregistrer le commentaire.",
      };
    }

    await supabase
      .from("profiles")
      .update({ popularity_score: (npc.popularity_score ?? 0) + 1 })
      .eq("id", npc.id);

    if (Math.random() < 0.65) {
      await maybeNpcReactionsOnPost(post.id, {
        humanAuthorId: post.author_id,
        postType: post.post_type,
        postContent: post.content,
        minCount: 1,
        maxCount: 3,
      });
    }

    return {
      ok: true,
      author: npc.username,
      postId: post.id,
      commentId: comment.id,
    };
  }

  return {
    ok: false,
    error: "Échec après plusieurs tentatives (contenu filtré ou Ollama).",
  };
}

export async function generateNpcComment(): Promise<GenerateNpcCommentResult> {
  return generateSingleNpcComment(new Set());
}

export async function generateNpcCommentsBatch(
  count = 2
): Promise<GenerateNpcCommentResult[]> {
  const results: GenerateNpcCommentResult[] = [];
  const usedPosts = new Set<number>();

  for (let i = 0; i < count; i++) {
    const result = await generateSingleNpcComment(usedPosts);
    results.push(result);
    if (result.ok) usedPosts.add(result.postId);
    if (!result.ok && result.error.includes("Ollama est hors ligne")) break;
  }

  return results;
}
