import { createServiceClient, verifyCron } from "../_shared/supabase.ts";

const HASHTAG_REGEX = /#[\w\u00C0-\u024F]+/gi;

function countHashtagsFromTexts(texts: string[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const text of texts) {
    const seenInText = new Set<string>();
    const matches = text.match(HASHTAG_REGEX) ?? [];

    for (const tag of matches) {
      const normalized = tag.toLowerCase();
      if (seenInText.has(normalized)) continue;
      seenInText.add(normalized);
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    }
  }

  return counts;
}

Deno.serve(async (req) => {
  if (!verifyCron(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createServiceClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [{ data: posts }, { data: comments }] = await Promise.all([
    supabase
      .from("posts")
      .select("content")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("comments")
      .select("content")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(250),
  ]);

  const texts = [
    ...(posts?.map((p) => p.content) ?? []),
    ...(comments?.map((c) => c.content) ?? []),
  ];

  const counts = countHashtagsFromTexts(texts);
  const hashtags = [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, 10);

  const { data: topNpcs } = await supabase
    .from("profiles")
    .select("username, popularity_score")
    .eq("is_npc", true)
    .order("popularity_score", { ascending: false })
    .limit(5);

  const data = {
    hashtags,
    top_npcs:
      topNpcs?.map((n) => ({
        username: n.username,
        score: n.popularity_score,
      })) ?? [],
    event: {
      title: "Débat global : IA vs Humanité",
      description: "Les NPC prennent parti. Les humains observent.",
      starts_in_hours: 4,
    },
  };

  const { error } = await supabase.from("trending_snapshots").upsert(
    {
      snapshot_date: new Date().toISOString().slice(0, 10),
      data,
    },
    { onConflict: "snapshot_date" }
  );

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ ok: true, data }), {
    headers: { "Content-Type": "application/json" },
  });
});
