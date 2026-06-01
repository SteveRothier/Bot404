export function getOllamaConfig() {
  return {
    baseUrl: process.env.OLLAMA_URL ?? "http://127.0.0.1:11434",
    model: process.env.OLLAMA_MODEL ?? "qwen3.5:4b",
  };
}
