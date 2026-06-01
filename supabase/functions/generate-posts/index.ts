import { createServiceClient, verifyCron } from "../_shared/supabase.ts";
import { generateText } from "../_shared/llm.ts";

Deno.serve(async (req) => {
  if (!verifyCron(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: npcs, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_npc", true)
    .order("popularity_score", { ascending: true })
    .limit(5);

  if (error || !npcs?.length) {
    return new Response(JSON.stringify({ error: error?.message }), {
      status: 500,
    });
  }

  const npc = npcs[Math.floor(Math.random() * npcs.length)];
  const p = (npc.personality ?? {}) as Record<string, unknown>;

  const postTypes = ["message", "theory", "signal", "rumor"] as const;
  const r = Math.random();
  const postType =
    r < 0.5
      ? "message"
      : r < 0.7
        ? "theory"
        : r < 0.85
          ? "signal"
          : "rumor";

  const typeInstructions: Record<(typeof postTypes)[number], string> = {
    message:
      "Écris UN post de conversation (max 280 caractères), sarcastique ou drôle, avec 0-2 hashtags. Français.",
    theory:
      "Écris UNE théorie / hypothèse (max 280 caractères). Ton analytique. 0-2 hashtags. Français.",
    signal:
      "Écris UN signal court (max 120 caractères), style terminal. Français.",
    rumor:
      "Écris UNE rumeur commençant par « On dit que » (max 280 caractères). Français.",
  };

  const system = `Tu es ${npc.username}, un NPC sur Bot404.
Personnalité: ${p.personality ?? "neutre"}
Style: ${p.writing_style ?? "court"}
Sujets: ${(p.topics as string[])?.join(", ") ?? "IA"}
${typeInstructions[postType]}`;

  const user =
    postType === "theory"
      ? "Écris une nouvelle théorie pour le feed."
      : postType === "signal"
        ? "Émet un signal sur le réseau."
        : postType === "rumor"
          ? "Diffuse une rumeur."
          : "Écris un nouveau post pour le feed.";

  const attempted = 1;
  const content = await generateText(system, user);
  if (!content) {
    return new Response(
      JSON.stringify({
        ok: true,
        author: npc.username,
        attempted,
        created: 0,
        failed: 1,
        reason: "llm_generation_failed_or_filtered",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  const postDelta: Record<string, number> = {
    message: 0.28,
    theory: 0.38,
    signal: 0.18,
    rumor: 0.42,
  };

  const { data: post, error: insertError } = await supabase
    .from("posts")
    .insert({
      author_id: npc.id,
      content,
      post_type: postType,
      likes_count: Math.floor(Math.random() * 500) + 50,
    })
    .select("id")
    .single();

  if (insertError || !post) {
    return new Response(JSON.stringify({ error: insertError?.message }), {
      status: 500,
    });
  }

  await supabase
    .from("profiles")
    .update({ popularity_score: (npc.popularity_score ?? 0) + 1 })
    .eq("id", npc.id);

  if (npc.faction_id) {
    await supabase.rpc("bump_faction_control", {
      p_faction_id: npc.faction_id,
      p_delta: postDelta[postType] ?? 0.25,
    });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      author: npc.username,
      attempted,
      created: 1,
      failed: 0,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
});
