import { createAdminClient } from "@/lib/supabase/admin";

const RUMOR_THRESHOLD = 8;
const THEORY_THRESHOLD = 10;

/** Si une rumeur ou théorie dépasse le seuil relay+amplify en 24h, crée un mini-événement. */
export async function maybePromoteRumorToEvent(postId: number) {
  const supabase = createAdminClient();

  const { data: post } = await supabase
    .from("posts")
    .select("id, post_type, content, relay_count, amplify_count, created_at")
    .eq("id", postId)
    .maybeSingle();

  if (!post || (post.post_type !== "rumor" && post.post_type !== "theory")) {
    return;
  }

  const threshold =
    post.post_type === "theory" ? THEORY_THRESHOLD : RUMOR_THRESHOLD;
  const score = (post.relay_count ?? 0) + (post.amplify_count ?? 0);
  if (score < threshold) return;

  const created = new Date(post.created_at).getTime();
  if (Date.now() - created > 24 * 60 * 60 * 1000) return;

  const slug = `rumor-boost-${postId}`;
  const { data: existing } = await supabase
    .from("world_events")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) return;

  await supabase.from("world_events").insert({
    slug,
    title:
      post.post_type === "theory"
        ? "Théorie amplifiée"
        : "Rumeur amplifiée",
    description: `Un${post.post_type === "theory" ? "e théorie" : "e rumeur"} (#${postId}) a franchi le seuil de propagation (${score} relais/amplifications).`,
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    effects: { source_post_id: postId, type: "rumor_boost" },
  });
}
