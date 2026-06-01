const FORBIDDEN = /\b(kill|suicide|nazi)\b/i;

export async function ollamaChat(
  system: string,
  user: string,
  maxChars = 500
): Promise<string | null> {
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
  return text.slice(0, maxChars);
}
