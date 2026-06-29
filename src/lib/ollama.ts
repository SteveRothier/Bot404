import {
  getOllamaConfig,
  getPublicOllamaModel,
  getPublicOllamaUrl,
  isLocalOllamaUrl,
} from "@/lib/ollama-config";

export type OllamaStatus = {
  online: boolean;
  model: string;
  /** Ollama sur localhost — le serveur Vercel ne peut pas le joindre. */
  localOnly?: boolean;
};

export function getDefaultOllamaStatus(): OllamaStatus {
  const { model } = getOllamaConfig();
  const publicModel = getPublicOllamaModel();
  return { online: false, model: publicModel ?? model };
}

export async function pingOllamaUrl(
  baseUrl: string,
  timeoutMs = 3000
): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/tags`, {
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

/** Vérification côté serveur (API route, scripts Node). */
export async function checkOllamaStatus(): Promise<OllamaStatus> {
  const { baseUrl, model } = getOllamaConfig();
  const localOnly = isLocalOllamaUrl(baseUrl);

  if (localOnly && process.env.VERCEL) {
    return { online: false, model, localOnly: true };
  }

  const online = await pingOllamaUrl(baseUrl);
  return { online, model, localOnly: localOnly && !online ? true : undefined };
}

/** Vérification côté navigateur (prod Vercel + Ollama sur le même PC). */
export async function checkOllamaStatusClient(
  fallbackModel: string
): Promise<OllamaStatus> {
  const publicUrl = getPublicOllamaUrl();
  const publicModel = getPublicOllamaModel();
  const model = publicModel ?? fallbackModel;

  if (publicUrl) {
    const online = await pingOllamaUrl(publicUrl);
    return {
      online,
      model,
      localOnly: isLocalOllamaUrl(publicUrl) || undefined,
    };
  }

  try {
    const res = await fetch("/api/ollama-status");
    const data = (await res.json()) as OllamaStatus;
    return {
      online: data.online,
      model: data.model ?? model,
      localOnly: data.localOnly,
    };
  } catch {
    return { online: false, model, localOnly: true };
  }
}
