import { checkOllamaStatus } from "@/lib/ollama";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Personality, Profile } from "@/lib/supabase/types";

const FORBIDDEN = /\b(kill|suicide|nazi)\b/i;

async function ollamaChat(system: string, user: string): Promise<string | null> {
  const baseUrl = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";
  const model = process.env.OLLAMA_MODEL ?? "qwen3.5:4b";

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      think: false,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    message?: { content?: string };
  };
  const text = data?.message?.content?.trim();
  if (!text || FORBIDDEN.test(text)) return null;
  return text.slice(0, 500);
}

function buildNpcPrompt(npc: Profile) {
  const p = (npc.personality ?? {}) as Personality;
  return `Tu es ${npc.username}, un NPC sur un réseau social fictif.
Personnalité: ${p.personality ?? "neutre"}
Style: ${p.writing_style ?? "court"}
Sujets: ${(p.topics ?? ["IA"]).join(", ")}
Écris UN seul post (max 280 caractères), sarcastique ou drôle, avec 1-2 hashtags. Français.`;
}

export type GenerateNpcPostResult =
  | { ok: true; author: string; postId: number }
  | { ok: false; error: string };

export async function generateNpcPost(): Promise<GenerateNpcPostResult> {
  const ollama = await checkOllamaStatus();
  if (!ollama.online) {
    return {
      ok: false,
      error: "Ollama est hors ligne. Lancez ollama serve puis réessayez.",
    };
  }

  const supabase = createAdminClient();

  const { data: npcs, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_npc", true)
    .order("popularity_score", { ascending: true })
    .limit(5);

  if (error || !npcs?.length) {
    return { ok: false, error: "Aucun NPC trouvé." };
  }

  const npc = npcs[Math.floor(Math.random() * npcs.length)] as Profile;
  const content = await ollamaChat(
    buildNpcPrompt(npc),
    "Écris un nouveau post pour le feed."
  );

  if (!content) {
    return {
      ok: false,
      error: "Échec de la génération (Ollama ou contenu filtré).",
    };
  }

  const { data: post, error: insertError } = await supabase
    .from("posts")
    .insert({
      author_id: npc.id,
      content,
      likes_count: Math.floor(Math.random() * 500) + 50,
    })
    .select("id")
    .single();

  if (insertError || !post) {
    return {
      ok: false,
      error: insertError?.message ?? "Impossible d'enregistrer le post.",
    };
  }

  await supabase
    .from("profiles")
    .update({ popularity_score: (npc.popularity_score ?? 0) + 1 })
    .eq("id", npc.id);

  return { ok: true, author: npc.username, postId: post.id };
}
