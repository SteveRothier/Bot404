export function getOllamaConfig() {
  return {
    baseUrl: process.env.OLLAMA_URL ?? "http://127.0.0.1:11434",
    model: process.env.OLLAMA_MODEL ?? "qwen3.5:4b",
  };
}

export function isLocalOllamaUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname === "127.0.0.1" || hostname === "localhost" || hostname === "::1";
  } catch {
    return false;
  }
}

/** URL pingée depuis le navigateur (Vercel + ollama sur le même PC). */
export function getPublicOllamaUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_OLLAMA_URL?.trim();
  return url || null;
}

export function getPublicOllamaModel(): string | null {
  const model = process.env.NEXT_PUBLIC_OLLAMA_MODEL?.trim();
  return model || null;
}
