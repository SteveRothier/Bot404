import type { OllamaChatProfile } from "@/lib/engine/content/ollama";
import type { OllamaRuntime } from "@/lib/ollama-config";

export type OllamaProvider = {
  chat: (
    system: string,
    user: string,
    maxChars?: number,
    profile?: OllamaChatProfile
  ) => Promise<string | null>;
};

export function createStaticOllamaProvider(
  runtime: OllamaRuntime,
  chatFn: (
    runtime: OllamaRuntime,
    system: string,
    user: string,
    maxChars: number,
    profile: OllamaChatProfile
  ) => Promise<string | null>,
  onCall?: () => void
): OllamaProvider {
  return {
    async chat(system, user, maxChars = 500, profile = "default") {
      onCall?.();
      return chatFn(runtime, system, user, maxChars, profile);
    },
  };
}
