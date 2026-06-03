import { createAdminClient } from "@/lib/supabase/admin";

export type NarrativeInteractionRow = {
  id: number;
  content: string;
  created_at: string;
  post_id: number;
  npc_username: string;
  human_username: string | null;
};

export async function getRecentNarrativeInteractions(
  limit = 8
): Promise<NarrativeInteractionRow[]> {
  const supabase = createAdminClient();

  const { data: comments } = await supabase
    .from("comments")
    .select(
      "id, content, created_at, post_id, narrative_signal_id, author:profiles!author_id(username, is_npc)"
    )
    .not("narrative_signal_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!comments?.length) return [];

  const rows: NarrativeInteractionRow[] = [];

  for (const c of comments) {
    const author = c.author as { username?: string; is_npc?: boolean } | null;
    if (!author?.is_npc) continue;

    const { data: signal } = await supabase
      .from("narrative_signals")
      .select("author_id")
      .eq("id", c.narrative_signal_id)
      .maybeSingle();

    let humanUsername: string | null = null;
    if (signal?.author_id) {
      const { data: human } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", signal.author_id)
        .maybeSingle();
      humanUsername = human?.username ?? null;
    }

    rows.push({
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      post_id: c.post_id,
      npc_username: author.username ?? "?",
      human_username: humanUsername,
    });
  }

  return rows;
}
