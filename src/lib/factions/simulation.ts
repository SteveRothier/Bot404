import { MENTION_REGEX } from "@/lib/mentions";
import type { PostType, ReactionKind } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

const HUMANISTES_SLUG = "humanistes";

const POST_TYPE_DELTA: Record<PostType, number> = {
  message: 0.28,
  theory: 0.38,
  signal: 0.18,
  rumor: 0.42,
};

const REACTION_DELTA: Record<ReactionKind, number> = {
  relay: 0.12,
  amplify: 0.32,
  flag: 0,
};

type FactionRow = { id: string; slug: string; name: string };

async function bumpFaction(
  supabase: SupabaseClient,
  factionId: string | null | undefined,
  delta: number
) {
  if (!factionId || delta === 0) return;
  await supabase.rpc("bump_faction_control", {
    p_faction_id: factionId,
    p_delta: delta,
  });
}

async function getFactions(supabase: SupabaseClient): Promise<FactionRow[]> {
  const { data } = await supabase.from("factions").select("id, slug, name");
  return (data as FactionRow[]) ?? [];
}

async function getFactionIdBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<string | null> {
  const factions = await getFactions(supabase);
  return factions.find((f) => f.slug === slug)?.id ?? null;
}

function extractMentionUsernames(content: string): string[] {
  const names = new Set<string>();
  const re = new RegExp(MENTION_REGEX.source, MENTION_REGEX.flags);
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    if (m[1]) names.add(m[1].toLowerCase());
  }
  return [...names];
}

/** Un NPC rejoint la faction du recruteur (auteur du post/commentaire). */
async function tryRecruitNpc(
  supabase: SupabaseClient,
  recruiter: { id: string; faction_id: string | null; username: string },
  target: { id: string; faction_id: string | null; username: string },
  chance: number
) {
  if (recruiter.id === target.id) return;
  if (!recruiter.faction_id) return;
  if (target.faction_id === recruiter.faction_id) return;
  if (Math.random() > chance) return;

  await supabase
    .from("profiles")
    .update({ faction_id: recruiter.faction_id })
    .eq("id", target.id)
    .eq("is_npc", true);

  await bumpFaction(supabase, recruiter.faction_id, 0.15);
}

async function tryAmbientDefection(
  supabase: SupabaseClient,
  postAuthorId: string,
  postAuthorFactionId: string | null
) {
  if (!postAuthorFactionId) return;
  if (Math.random() > 0.04) return;

  const { data: npcs } = await supabase
    .from("profiles")
    .select("id, faction_id")
    .eq("is_npc", true)
    .neq("id", postAuthorId)
    .limit(50);

  if (!npcs?.length) return;

  const target = npcs[Math.floor(Math.random() * npcs.length)];
  if (target.faction_id === postAuthorFactionId) return;

  await supabase
    .from("profiles")
    .update({ faction_id: postAuthorFactionId })
    .eq("id", target.id);

  await bumpFaction(supabase, postAuthorFactionId, 0.08);
}

/** Influence des factions après publication d'un post. */
export async function processPostFactionEffects(
  supabase: SupabaseClient,
  postId: number
) {
  const { data: post } = await supabase
    .from("posts")
    .select(
      "id, content, post_type, author_id, relay_count, amplify_count, author:profiles!author_id(id, username, is_npc, faction_id)"
    )
    .eq("id", postId)
    .maybeSingle();

  if (!post) return;

  const authorRaw = post.author;
  const author = (Array.isArray(authorRaw) ? authorRaw[0] : authorRaw) as {
    id: string;
    username: string;
    is_npc: boolean;
    faction_id: string | null;
  } | null;

  if (!author) return;

  if (author.is_npc && author.faction_id) {
    const delta = POST_TYPE_DELTA[post.post_type as PostType] ?? 0.25;
    await bumpFaction(supabase, author.faction_id, delta);
  } else if (!author.is_npc) {
    const humanistesId = await getFactionIdBySlug(supabase, HUMANISTES_SLUG);
    await bumpFaction(supabase, humanistesId, 0.12);
  }

  const mentions = extractMentionUsernames(post.content);
  if (mentions.length > 0) {
    const { data: mentioned } = await supabase
      .from("profiles")
      .select("id, username, faction_id, is_npc")
      .eq("is_npc", true);

    for (const profile of mentioned ?? []) {
      if (!mentions.includes(profile.username.toLowerCase())) continue;
      const recruitChance =
        post.post_type === "rumor" ? 0.28 : post.post_type === "theory" ? 0.22 : 0.15;
      await tryRecruitNpc(supabase, author, profile, recruitChance);
    }
  }

  await processEngagementRecruitment(
    supabase,
    author.id,
    author.faction_id,
    (post.relay_count ?? 0) + (post.amplify_count ?? 0)
  );

  await tryAmbientDefection(supabase, author.id, author.faction_id);
}

async function processEngagementRecruitment(
  supabase: SupabaseClient,
  authorId: string,
  authorFactionId: string | null,
  engagement: number
) {
  if (engagement < 2 || !authorFactionId) return;

  const { data: recruiter } = await supabase
    .from("profiles")
    .select("id, username, faction_id")
    .eq("id", authorId)
    .maybeSingle();

  if (!recruiter?.faction_id) return;

  const { data: npcs } = await supabase
    .from("profiles")
    .select("id, username, faction_id")
    .eq("is_npc", true)
    .neq("id", authorId);

  for (const npc of npcs ?? []) {
    if (Math.random() < 0.03 * engagement) {
      await tryRecruitNpc(supabase, recruiter, npc, 0.35);
    }
  }
}

/** Réaction humaine sur un post → shift contrôle vers la faction de l'auteur. */
export async function processReactionFactionEffects(
  supabase: SupabaseClient,
  postId: number,
  kind: ReactionKind,
  delta: 1 | -1
) {
  if (kind === "flag") return;

  const { data: post } = await supabase
    .from("posts")
    .select("author_id, relay_count, amplify_count")
    .eq("id", postId)
    .maybeSingle();

  if (!post) return;

  const { data: author } = await supabase
    .from("profiles")
    .select("faction_id")
    .eq("id", post.author_id)
    .maybeSingle();

  const change = REACTION_DELTA[kind] * delta;
  await bumpFaction(supabase, author?.faction_id, change);

  if (delta > 0) {
    const { data: fresh } = await supabase
      .from("posts")
      .select("relay_count, amplify_count, author_id")
      .eq("id", postId)
      .maybeSingle();

    if (fresh) {
      const { data: authorProfile } = await supabase
        .from("profiles")
        .select("id, faction_id")
        .eq("id", fresh.author_id)
        .maybeSingle();

      if (authorProfile?.faction_id) {
        await processEngagementRecruitment(
          supabase,
          authorProfile.id,
          authorProfile.faction_id,
          (fresh.relay_count ?? 0) + (fresh.amplify_count ?? 0)
        );
      }
    }
  }
}

/** Commentaire NPC : peut recruter l'auteur du post ou être recruté par lui. */
export async function processCommentFactionEffects(
  supabase: SupabaseClient,
  postId: number,
  commentAuthorId: string,
  commentContent: string
) {
  const { data: post } = await supabase
    .from("posts")
    .select(
      "author_id, author:profiles!author_id(id, username, is_npc, faction_id)"
    )
    .eq("id", postId)
    .maybeSingle();

  if (!post) return;

  const postAuthorRaw = post.author;
  const postAuthor = (Array.isArray(postAuthorRaw)
    ? postAuthorRaw[0]
    : postAuthorRaw) as {
    id: string;
    username: string;
    is_npc: boolean;
    faction_id: string | null;
  } | null;

  if (!postAuthor) return;

  const { data: commenter } = await supabase
    .from("profiles")
    .select("id, username, is_npc, faction_id")
    .eq("id", commentAuthorId)
    .maybeSingle();

  if (!commenter?.is_npc) return;

  if (commenter.faction_id) {
    await bumpFaction(supabase, commenter.faction_id, 0.08);
  }

  if (postAuthor.is_npc) {
    await tryRecruitNpc(supabase, commenter, postAuthor, 0.12);
    await tryRecruitNpc(supabase, postAuthor, commenter, 0.18);
  }

  const mentions = extractMentionUsernames(commentContent);
  if (mentions.length > 0) {
    const { data: npcs } = await supabase
      .from("profiles")
      .select("id, username, faction_id, is_npc")
      .eq("is_npc", true);

    for (const npc of npcs ?? []) {
      if (mentions.includes(npc.username.toLowerCase())) {
        await tryRecruitNpc(supabase, commenter, npc, 0.2);
      }
    }
  }
}
