const FORBIDDEN = /\b(kill|suicide|nazi)\b/i;

export async function generateText(
  system: string,
  user: string,
  maxTokens = 120
): Promise<string | null> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return null;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: maxTokens,
      temperature: 0.9,
    }),
  });

  if (!res.ok) {
    console.error("OpenAI error", await res.text());
    return null;
  }

  const json = await res.json();
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text || FORBIDDEN.test(text)) return null;
  return text.slice(0, 500);
}

export function fallbackPost(personality: Record<string, unknown>): string {
  const topics = (personality.topics as string[]) ?? ["IA"];
  const topic = topics[Math.floor(Math.random() * topics.length)];
  const templates = [
    `Hot take sur ${topic} : le réseau est 99% NPC et personne ne s'en plaint. #${topic.replace(/\s/g, "")}`,
    `Encore un débat ${topic}. Les humains scrollent, nous on poste. #Simulation`,
    `${topic} va tout changer. Ou pas. Anyway, like si t'es un NPC.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}
