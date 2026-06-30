"use client";

import {
  fetchOllamaChat,
  type OllamaChatProfile,
} from "@/lib/engine/content/ollama";
import {
  isLocalOllamaUrl,
  type OllamaRuntime,
} from "@/lib/ollama-config";

export async function ollamaChatClient(
  runtime: OllamaRuntime,
  system: string,
  user: string,
  maxChars = 500,
  profile: OllamaChatProfile = "default"
): Promise<string | null> {
  return fetchOllamaChat(runtime, system, user, maxChars, profile);
}

export function toOllamaRuntime(input: {
  endpointUrl: string;
  model: string;
}): OllamaRuntime {
  return {
    baseUrl: input.endpointUrl,
    model: input.model,
  };
}

export function needsClientOllamaBridge(
  endpointUrl: string,
  online: boolean
): boolean {
  if (typeof window === "undefined" || !online) return false;

  const host = window.location.hostname.toLowerCase();
  const onLocalDev = host === "localhost" || host === "127.0.0.1";
  if (onLocalDev) return false;

  const url = endpointUrl.trim() || "http://127.0.0.1:11434";
  return isLocalOllamaUrl(url);
}

export function effectiveOllamaEndpoint(endpointUrl: string): string {
  return endpointUrl.trim() || "http://127.0.0.1:11434";
}
