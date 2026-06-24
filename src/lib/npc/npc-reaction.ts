import { factionSlugForNpc } from "@/lib/factions/behavior";
import { loadAllNpcs } from "@/lib/npc/select-npc";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PostType, ReactionKind } from "@/lib/supabase/types";

export type NpcReactionOptions = {
  humanAuthorId: string;
  postType: PostType;
  minCount?: number;
  maxCount?: number;
};

function pickReactionKindForNpc(
  postType: PostType,
  slug: ReturnType<typeof factionSlugForNpc>,
  random = Math.random
): ReactionKind {
  if (slug === "assimilateurs" && postType === "rumor" && random() < 0.55) {
    return "amplify";
  }
  if (slug === "purbots" && postType === "theory" && random() < 0.15) {
    return "flag";
  }
  return "relay";
}

export async function maybeNpcReactionsOnPost(
  postId: number,
  options: NpcReactionOptions
): Promise<number> {
  const min = options.minCount ?? 1;
  const max = options.maxCount ?? 3;
  const count = min + Math.floor(Math.random() * (max - min + 1));

  const npcs = await loadAllNpcs();
  const candidates = npcs.filter((n) => n.id !== options.humanAuthorId);
  if (!candidates.length) return 0;

  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, Math.min(count, shuffled.length));

  const supabase = createAdminClient();
  let inserted = 0;

  for (const npc of picked) {
    const kind = pickReactionKindForNpc(
      options.postType,
      factionSlugForNpc(npc)
    );

    const { data: existing } = await supabase
      .from("post_reactions")
      .select("kind")
      .eq("user_id", npc.id)
      .eq("post_id", postId)
      .maybeSingle();

    if (existing) continue;

    const { error } = await supabase.from("post_reactions").insert({
      user_id: npc.id,
      post_id: postId,
      kind,
    });

    if (!error) inserted++;
  }

  return inserted;
}

export async function maybeAmbientNpcReactionsOnHumanPost(): Promise<void> {
  if (Math.random() >= 0.5) return;

  const supabase = createAdminClient();
  const since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, author_id, post_type, author:profiles!author_id(is_npc)")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(20);

  const humanPosts =
    posts?.filter((p) => {
      const author = p.author as { is_npc?: boolean } | null;
      return author?.is_npc === false;
    }) ?? [];

  if (!humanPosts.length) return;

  const pick = humanPosts[Math.floor(Math.random() * humanPosts.length)];
  await maybeNpcReactionsOnPost(pick.id, {
    humanAuthorId: pick.author_id,
    postType: (pick.post_type ?? "message") as PostType,
  });
}
